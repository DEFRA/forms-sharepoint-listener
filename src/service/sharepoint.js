import { hasComponentsEvenIfNoNext } from '@defra/forms-model'

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
 * Parses JSON config of form mappings
 * @returns {FormMapping[]} Array of form mappings
 */
export function loadFormMappings() {
  const sharepoint = config.get('sharepoint')
  return JSON.parse(sharepoint.formMappings).mappings
}

const formMappings = loadFormMappings()
const allowedForms = new Map(
  formMappings.map((config) => [config.formId, config])
)

/**
 * Strips spaces to match the name that Sharepoint would use internally for a field
 * @param { string | undefined } name
 */
export function escapeFieldName(name) {
  return name?.replaceAll(' ', '') ?? ''
}

/**
 * Left pad with a zero if necessary
 * @param {number} num
 */
export function lpad(num) {
  return num < 10 ? `0${num}` : `${num}`
}

/**
 * @param { string | number | DateObject | undefined } value - incoming value
 */
export function coerceDatatype(value) {
  if (value && Object.keys(value).includes('day')) {
    const dateObject = /** @type {DateObject} */ (value)
    return new Date(
      `${dateObject.year}-${lpad(dateObject.month)}-${lpad(dateObject.day)}`
    )
  }
  return value
}

/**
 * Adds items to a SharePoint list
 * @param {string} siteId - id of the site
 * @param {string} listId - id of the list
 * @param {Map<string, string>} fields - record of field names and values
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
  // Check if the message is for saving to Sharepoint
  if (!allowedForms.has(message.meta.formId)) {
    return
  }

  const { siteId, listId } = allowedForms.get(message.meta.formId) ?? {
    siteId: '',
    listId: ''
  }
  const { formId, status, versionMetadata } = message.meta

  logger.info(
    `Saving data for form id ${formId} version ${versionMetadata?.versionNumber} to sharepoint list`
  )

  const definition = await getFormDefinition(
    formId,
    status,
    versionMetadata?.versionNumber
  )

  const componentNameToShortDesc = new Map(
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

  /**
   * @param {string} key - data element key
   */
  function getShortDescription(key) {
    return componentNameToShortDesc.get(key) ?? 'unknown'
  }

  // Get all the components that exist in the message data and
  // convert them to a map of column name (short description) to value.
  // This is done is categories of 'mainColumns', 'fileColumns' and 'repeaterColumns'

  const mainColumns = new Map(
    Object.entries(message.data.main).map(([key, value]) => [
      getShortDescription(key),
      coerceDatatype(value)
    ])
  )

  // Add submission date
  mainColumns.set(escapeFieldName('Submission date'), message.meta.timestamp)

  // Add files
  const fileColumns = new Map(
    Object.entries(message.data.files).map(([key, value]) => {
      const fileLinks = Array.isArray(value)
        ? value.map((f) => f.userDownloadLink).join(' \r\n')
        : ''
      return [getShortDescription(key), fileLinks]
    })
  )

  // Add repeaters
  const repeaterColumns = new Map()
  Object.entries(message.data.repeaters).forEach(([, repeaterRows]) => {
    for (let index = 0; index < repeaterRows.length; index++) {
      const row = repeaterRows[index]
      Object.entries(row).forEach(([key, value]) => {
        const componentKey = escapeFieldName(
          `${getShortDescription(key)} ${index + 1}`
        )
        repeaterColumns.set(componentKey, coerceDatatype(value))
      })
    }
  })

  logger.info(
    `Constructed data for form id ${formId} - about to call Sharepoint`
  )

  await addItemsByFieldName(
    siteId,
    listId,
    new Map([...mainColumns, ...fileColumns, ...repeaterColumns])
  )

  logger.info(`Saved successfully to Sharepoint for form id ${formId}`)
}

/**
 * @import { FormAdapterSubmissionMessage } from '@defra/forms-engine-plugin/engine/types.js'
 */
