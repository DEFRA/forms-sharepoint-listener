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
 * @typedef {{ displayName: string, name: string, number?: object, text?: object, dateTime?: object } } SharepointColumn
 */

/**
 * @import { FormStatus } from '@defra/forms-model'
 */
