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
import {
  addItemsByFieldName,
  getColumnPropertiesFromGraph
} from '~/src/service/ms-graph.js'
import { getGraphClient } from '~/src/service/sharepoint-client.js'

const logger = createLogger()
const graphClient = getGraphClient()

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
 * @param {any} value
 * @returns {string}
 */
export function getJsDatatype(value) {
  if (typeof value === 'string') {
    return 'string'
  }
  if (typeof value === 'number') {
    return 'number'
  }
  if (value instanceof Date) {
    return 'date'
  }
  return 'unknown'
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
 * @param {Component} component
 * @param {string} key
 * @param {any} value
 * @param {Map<string, { name: string, datatype: string }>} properties
 */
export function datatypeGuard(component, key, value, properties) {
  if (!value) {
    return
  }

  const jsDatatype = getJsDatatype(value)
  const sharepointProp = properties.get(key)
  if (
    jsDatatype === 'number' &&
    sharepointProp?.datatype === 'number' &&
    component.type === ComponentType.NumberField
  ) {
    return
  }
  if (
    jsDatatype === 'date' &&
    sharepointProp?.datatype === 'date' &&
    component.type === ComponentType.DatePartsField
  ) {
    return
  }
  // Assume all other component types are to handle string values
  if (jsDatatype === 'string' && sharepointProp?.datatype === 'string') {
    return
  }
  throw new Error(
    `Invalid datatype for column '${key}' - ${jsDatatype} in form definition but ${sharepointProp?.datatype ?? 'missing column'} in Sharepoint list`
  )
}

/**
 * Map display names to internal names (since Sharepoint only accepts internal names when using MS Graph)
 * @param {Map<string, CellValue>} fields
 * @param {Map<string, { name: string, datatype: string }>} properties
 * @returns {Map<string, CellValue>}
 */
export function mapFieldNames(fields, properties) {
  const mapped = new Map()
  for (const [key, value] of fields.entries()) {
    const property = properties.get(key)
    if (!property?.name) {
      throw new Error(`Internal name not found for display name '${key}'`)
    }
    if (key && value) {
      mapped.set(property.name, value)
    }
  }
  return mapped
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
        'shortDescription' in comp ? comp.name : '--missing-short-desc--',
        'shortDescription' in comp ? comp.shortDescription?.trim() : ''
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
  fields.set('Submission date', message.meta.timestamp)

  // Add submission type
  fields.set('Submission type', message.meta.isPreview ? 'Preview' : 'Real')

  // Add reference number (if enabled)
  if (definition.options?.showReferenceNumber) {
    fields.set('Reference number', message.meta.referenceNumber)
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
  fields.set('Payment description', payment.description)

  // Add payment amount
  fields.set('Payment amount', payment.amount)

  // Add payment reference
  fields.set('Payment reference', payment.reference)

  // Add payment date
  fields.set('Payment date', payment.createdAt)
}

/**
 *
 * @param {SharepointColumn} col
 */
export function getSharepointDatatype(col) {
  if (col.number) {
    return 'number'
  }
  if (col.dateTime) {
    return 'date'
  }
  if (col.text) {
    return 'string'
  }
  return 'unknown'
}

/**
 * Gets list of column properties as a map (specifically display name and internal name) from a SharePoint list
 * @param {string} siteId - id of the site
 * @param {string} listId - id of the list
 */
export async function createMapOfColumnProperties(siteId, listId) {
  const columns = await getColumnPropertiesFromGraph(
    graphClient,
    siteId,
    listId
  )
  return new Map(
    (columns ?? []).map((col) => [
      col.displayName,
      {
        name: col.name,
        datatype: getSharepointDatatype(col)
      }
    ])
  )
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

  const columnProperties = await createMapOfColumnProperties(siteId, listId)

  const formModel = new FormModel(replaceCustomControllers(definition), {
    basePath: ''
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
      const hasRepeaterData = repeaterName in data.repeaters
      const items = hasRepeaterData ? data.repeaters[repeaterName] : []

      for (let index = 0; index < items.length; index++) {
        const value = getValue(items[index], key, component)
        const baseComponentKey = componentNameToShortDesc.get(component.name)
        const componentKey = `${baseComponentKey} ${index + 1}`

        datatypeGuard(component, componentKey, value, columnProperties)
        fields.set(componentKey, value)
      }
    } else if (component.type === ComponentType.FileUploadField) {
      const files = data.files[component.name]
      const fileLinks = Array.isArray(files)
        ? files.map((f) => f.userDownloadLink).join(' \r\n')
        : ''

      const fieldName = componentNameToShortDesc.get(component.name) ?? ''
      datatypeGuard(component, fieldName, 'string', columnProperties)
      fields.set(fieldName, fileLinks)
    } else if (component.type === ComponentType.PaymentField) {
      addPaymentFields(message, fields)
    } else {
      const value = getValue(data.main, key, component)

      const fieldName = componentNameToShortDesc.get(component.name) ?? ''
      datatypeGuard(component, fieldName, value, columnProperties)
      fields.set(fieldName, value)
    }
  })

  logger.info(
    `Constructed data for form id ${formId} - about to call Sharepoint`
  )

  const mappedFields = mapFieldNames(fields, columnProperties)
  await addItemsByFieldName(graphClient, siteId, listId, mappedFields)

  logger.info(`Saved successfully to Sharepoint for form id ${formId}`)
}

/**
 * @import { FormDefinition } from '@defra/forms-model'
 * @import { FormAdapterSubmissionMessage, FormAdapterSubmissionMessageMeta } from '@defra/forms-engine-plugin/engine/types.js'
 * @import { Component } from '@defra/forms-engine-plugin/engine/components/helpers/components.js'
 * @import { CellValue, FormMapping, SharepointColumn } from '~/src/service/sharepoint-types.js'
 */
