import {
  addItemsByFieldName,
  getColumnPropertiesFromGraph
} from '~/src/service/ms-graph.js'

const mockClientGetCall = () => ({
  value: [{ name: 'name1', displayName: 'display name 1' }]
})
const mockClientPostCall = jest.fn()
const mockClientApiCall = {
  post: (/** @type {Map<string, string>} */ fields) =>
    mockClientPostCall(fields),
  get: () => mockClientGetCall()
}
const mockGraphClient = {
  api: () => mockClientApiCall
}

const siteId = 'my-site-id'
const listId = 'my-list-id'

describe('ms-graph', () => {
  describe('addItemsByFieldName', () => {
    it('should send correct API call', async () => {
      /** @type {Map<string, string>} */
      const fields = new Map()
      fields.set('field1', 'value1')
      // @ts-expect-error - partial mock of client
      await addItemsByFieldName(mockGraphClient, siteId, listId, fields)
      expect(mockClientPostCall).toHaveBeenCalledWith({
        fields: {
          field1: 'value1'
        }
      })
    })
  })

  describe('getColumnPropertiesFromGraph', () => {
    it('should send correct API call', async () => {
      /** @type {Map<string, string>} */
      const fields = new Map()
      fields.set('field1', 'value1')
      const res = await getColumnPropertiesFromGraph(
        // @ts-expect-error - partial mock of client
        mockGraphClient,
        siteId,
        listId
      )
      expect(res).toEqual([{ displayName: 'display name 1', name: 'name1' }])
    })
  })
})
