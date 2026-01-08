import { FormModel } from '@defra/forms-engine-plugin/engine/models/FormModel.js'
import {
  ComponentType,
  hasComponentsEvenIfNoNext,
  hasRepeater,
  replaceCustomControllers
} from '@defra/forms-model'

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
 * Parses JSON config of form mappings
 * @returns {FormMapping[]} Array of form mappings
 */
export function loadFormMappings() {
  const sharepoint = config.get('sharepoint')
  return JSON.parse(sharepoint.formMappings).mappings
}

const formMappings = loadFormMappings()
const allowedForms = new Map(formMappings.map((conf) => [conf.formId, conf]))

/**
 * Strips spaces to match the name that Sharepoint would use internally for a field
 * @param { string | undefined } name
 */
export function escapeFieldName(name) {
  return name?.replaceAll(' ', '') ?? ''
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
    if (
      component.type === ComponentType.DatePartsField ||
      component.type === ComponentType.MonthYearField
    ) {
      return new Date(asText)
    }
    if (component.type === ComponentType.NumberField) {
      return Number.parseFloat(asText)
    }
  }

  return asText
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
    key in data ? component.getDisplayStringFromFormValue(data[key]) : undefined

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
  // Check if the message is enabled for saving to Sharepoint
  const allowedForm = allowedForms.get(message.meta.formId)
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

  // Add submission date
  fields.set(escapeFieldName('Submission date'), message.meta.timestamp)

  formModel.componentMap.forEach((component, key) => {
    if (!component.isFormComponent) {
      return
    }

    if (hasRepeater(component.page.pageDef)) {
      const repeaterName = component.page.pageDef.repeat.options.name
      const hasRepeaterData = repeaterName in data.repeaters
      const items = hasRepeaterData ? data.repeaters[repeaterName] : []

      for (let index = 0; index < items.length; index++) {
        const value = getValue(items[index], key, component)
        const componentKey = `${getSharepointFieldName(component)}${index + 1}`

        fields.set(componentKey, value)
      }
    } else if (component.type === ComponentType.FileUploadField) {
      const files = data.files[component.name]
      const fileLinks = Array.isArray(files)
        ? files.map((f) => f.userDownloadLink).join(' \r\n')
        : ''

      fields.set(getSharepointFieldName(component), fileLinks)
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
 * @import { FormDefinition } from '@defra/forms-model'
 * @import { FormAdapterSubmissionMessage } from '@defra/forms-engine-plugin/engine/types.js'
 * @import { Component } from '@defra/forms-engine-plugin/engine/components/helpers/components.js'
 */
