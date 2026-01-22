import { getGraphClient } from '~/src/service/sharepoint-client.js'

describe('sharepoint client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getGraphClient', () => {
    it('should return client', () => {
      const client = getGraphClient()
      expect(client).toBeDefined()
    })
  })
})
