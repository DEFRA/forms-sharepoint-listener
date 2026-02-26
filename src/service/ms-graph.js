/**
 * Gets list of column properties from a SharePoint list
 * @param {Client} graphClient
 * @param {string} siteId - id of the site
 * @param {string} listId - id of the list
 */
export async function getColumnPropertiesFromGraph(
  graphClient,
  siteId,
  listId
) {
  const response = await graphClient
    .api(`/sites/${siteId}/lists/${listId}/columns`)
    .get()
  return /** @type { SharepointColumn[] | undefined } */ (response.value)
}

/**
 * Adds items to a SharePoint list
 * @param {Client} graphClient
 * @param {string} siteId - id of the site
 * @param {string} listId - id of the list
 * @param {Map<string, CellValue>} fields - record of field names and values
 */
export function addItemsByFieldName(graphClient, siteId, listId, fields) {
  return graphClient.api(`/sites/${siteId}/lists/${listId}/items`).post({
    fields: Object.fromEntries(fields)
  })
}

/**
 * @import { Client } from '@microsoft/microsoft-graph-client'
 * @import { CellValue, SharepointColumn } from '~/src/service/sharepoint-types.js'
 */
