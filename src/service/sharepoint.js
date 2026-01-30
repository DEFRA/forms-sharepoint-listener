import { FormModel } from '@defra/forms-engine-plugin/engine/models/FormModel.js'
import {
  ComponentType,
  hasComponentsEvenIfNoNext,
  hasRepeater,
  replaceCustomControllers
} from '@defra/forms-model'

import { formMappingsSchema } from '~/src/config/form-mappings-schema.js'
import { config } from '~/src/config/index.js'
import { createLogger } from '~/src/helpers/logging/logger.js'
import { getFormDefinition } from '~/src/lib/manager.js'
import { getGraphClient } from '~/src/service/sharepoint-client.js'

const logger = createLogger()
const graphClient = getGraphClient()

/**
 * @typedef FormMapping
 * @property {string} siteId - guid for the sharepoint site
 * @property {string} listId - guid for the sharepoint list
 * @property {string} formId - guid for the form
 * @property {FormStatus} status - live or draft
 */

/**
 * @typedef DateObject
 * @property {number} day - day of the month e.g. 21
 * @property {number} month - month of the year e.g. 7
 * @property {number} year - 4 digit year e.g. 2025
 */

/**
 * @typedef { string | number | Date | undefined } CellValue
 */

/**
 * Construct key for storing unique config row
 * @param { FormMapping | FormAdapterSubmissionMessageMeta } conf
 */
export function getConfigKey(conf) {
  return `${conf.formId}:${conf.status}`
}

/**
 * Parses JSON config of form mappings
 * @param {string} formMappingsConfig
 * @returns {FormMapping[]} Array of form mappings
 */
export function loadFormMappings(formMappingsConfig) {
  const mappings = JSON.parse(formMappingsConfig)
  const result = formMappingsSchema.validate(mappings)
  if (result.error) {
    throw new Error(
      `Invalid Sharepoint form mappings config - ${result.error.message} : ${formMappingsConfig}`
    )
  }
  const formMappingList = /** @type {{ mappings: FormMapping[] }} */ (
    result.value
  )
  return formMappingList.mappings
}

const formMappings = loadFormMappings(config.get('sharepoint').formMappings)
const allowedForms = new Map(
  formMappings.map((conf) => [getConfigKey(conf), conf])
)

/**
 * Strips spaces to match the name that Sharepoint would use internally for a field
 * NOTE - Sharepoint column names get truncated to max 32 characters
 * @param { string | undefined } name
 */
export function escapeFieldName(name) {
  const fullName =
    name?.replaceAll(' ', '').replaceAll("'", '').replace('-', '_x002d_') ?? ''
  return fullName.length < 32 ? fullName : fullName.substring(0, 32)
}

/**
 * Coerce the value from text if the component is a
 * DatePartsField, MonthYearField or NumberField
 * @param {string | undefined} asText - the value as text
 * @param {Component} component - the form component
 * @returns {CellValue} the spreadsheet cell value
 */
export function coerceDataValue(asText, component) {
  if (asText) {
    if (component.type === ComponentType.DatePartsField) {
      return new Date(asText)
    }
    if (component.type === ComponentType.NumberField) {
      return Number.parseFloat(asText)
    }
  }

  return asText
}

/**
 * @param {Component} component
 * @param {any} value
 */
export function componentValueMapper(component, value) {
  if (component.type === ComponentType.EastingNorthingField) {
    return value && 'easting' in value && 'northing' in value
      ? `Easting: ${value.easting}, Northing: ${value.northing}`
      : ''
  }

  if (component.type === ComponentType.MonthYearField) {
    if (value && 'year' in value && 'month' in value) {
      const { month, year } = value
      const monthStr = month < 10 ? `0${month}` : month.toString()
      return `${year}/${monthStr}`
    }
    return ''
  }

  return component.getDisplayStringFromFormValue(value)
}

/**
 * Extracts the component value from the provided data and coerces to the appropriate type
 * @param {Record<string, any>} data - the answers data
 * @param {string} key - the component key (name)
 * @param {Component} component - the form component
 * @returns {CellValue}
 */
export function getValue(data, key, component) {
  const asText =
    key in data ? componentValueMapper(component, data[key]) : undefined

  return coerceDataValue(asText, component)
}

/**
 * @param {FormDefinition} definition
 */
export function createMapOfComponentNameToShortDesc(definition) {
  return new Map(
    definition.pages.flatMap((page) => {
      const pageWithComponents = hasComponentsEvenIfNoNext(page)
        ? page.components
        : []
      return pageWithComponents.map((comp) => [
        comp.name,
        escapeFieldName(
          'shortDescription' in comp ? comp.shortDescription : comp.name
        )
      ])
    })
  )
}

/**
 * @param {FormDefinition} definition
 * @param {FormAdapterSubmissionMessage} message
 * @param {Map<string, CellValue >} fields
 */
export function addBaseFields(definition, message, fields) {
  // Add submission date
  fields.set(escapeFieldName('Submission date'), message.meta.timestamp)

  // Add submission type
  fields.set(
    escapeFieldName('Submission type'),
    message.meta.isPreview ? 'Preview' : 'Real'
  )

  // Add reference number (if enabled)
  if (definition.options?.showReferenceNumber) {
    fields.set(
      escapeFieldName('Reference number'),
      message.meta.referenceNumber
    )
  }
}

/**
 * @param {FormAdapterSubmissionMessage} message
 * @param {Map<string, CellValue>} fields
 */
export function addPaymentFields(message, fields) {
  const payment = message.data.payment

  if (!payment) {
    return
  }

  // Add payment description
  fields.set(escapeFieldName('Payment description'), payment.description)

  // Add payment amount
  fields.set(escapeFieldName('Payment amount'), payment.amount)

  // Add payment reference
  fields.set(escapeFieldName('Payment reference'), payment.reference)

  // Add payment date
  fields.set(escapeFieldName('Payment date'), payment.createdAt)
}

/**
 * Adds items to a SharePoint list
 * @param {string} siteId - id of the site
 * @param {string} listId - id of the list
 * @param {Map<string, CellValue>} fields - record of field names and values
 */
export function addItemsByFieldName(siteId, listId, fields) {
  return graphClient.api(`/sites/${siteId}/lists/${listId}/items`).post({
    fields: Object.fromEntries(fields)
  })
}

/**
 * Save data to Sharepoint list
 * @param {FormAdapterSubmissionMessage} message
 * @returns {Promise<void>}
 */
export async function saveToSharepointList(message) {
  // Check if the message is enabled for saving to Sharepoint for this formId/isPreview/status
  const configKey = getConfigKey(message.meta)
  const allowedForm = allowedForms.get(configKey)
  if (!allowedForm) {
    return
  }

  const { siteId, listId } = allowedForm
  const { formId, status, versionMetadata } = message.meta
  const data = message.data

  logger.info(
    `Saving data for form id ${formId} version ${versionMetadata?.versionNumber} to sharepoint list`
  )

  const definition = await getFormDefinition(
    formId,
    status,
    versionMetadata?.versionNumber
  )

  const componentNameToShortDesc =
    createMapOfComponentNameToShortDesc(definition)

  /**
   * @param {Component} component
   */
  function getSharepointFieldName(component) {
    return (
      componentNameToShortDesc.get(component.name) ??
      escapeFieldName(component.name)
    )
  }

  const formModel = new FormModel(replaceCustomControllers(definition), {
    basePath: '',
    versionNumber: versionMetadata?.versionNumber
  })

  /** @type {Map<string, CellValue >} */
  const fields = new Map()

  // Add base fields
  addBaseFields(definition, message, fields)

  formModel.componentMap.forEach((component, key) => {
    if (!component.isFormComponent) {
      return
    }

    if (hasRepeater(component.page.pageDef)) {
      const repeaterName = component.page.pageDef.repeat.options.name
      const maxRepeaterItems = /** @type {number} */ (
        component.page.pageDef.repeat.schema.max
      )
      const hasRepeaterData = repeaterName in data.repeaters
      const items = hasRepeaterData ? data.repeaters[repeaterName] : []

      for (let index = 0; index < items.length; index++) {
        const value = getValue(items[index], key, component)
        const baseComponentKey = getSharepointFieldName(component)
        if (baseComponentKey.length + `${maxRepeaterItems}`.length > 32) {
          throw new Error(
            `Repeater columns plus number index cannot be longer than 32 characters (with spaces stripped) - shortDesc: ${baseComponentKey}${maxRepeaterItems} formId: ${formId}`
          )
        }

        const componentKey = `${baseComponentKey}${index + 1}`

        fields.set(componentKey, value)
      }
    } else if (component.type === ComponentType.FileUploadField) {
      const files = data.files[component.name]
      const fileLinks = Array.isArray(files)
        ? files.map((f) => f.userDownloadLink).join(' \r\n')
        : ''

      fields.set(getSharepointFieldName(component), fileLinks)
    } else if (component.type === ComponentType.PaymentField) {
      addPaymentFields(message, fields)
    } else {
      const value = getValue(data.main, key, component)

      fields.set(getSharepointFieldName(component), value)
    }
  })

  logger.info(
    `Constructed data for form id ${formId} - about to call Sharepoint`
  )

  await addItemsByFieldName(siteId, listId, fields)

  logger.info(`Saved successfully to Sharepoint for form id ${formId}`)
}

/**
 * @import { FormDefinition, FormStatus } from '@defra/forms-model'
 * @import { FormAdapterSubmissionMessage, FormAdapterSubmissionMessageMeta } from '@defra/forms-engine-plugin/engine/types.js'
 * @import { Component } from '@defra/forms-engine-plugin/engine/components/helpers/components.js'
 */
