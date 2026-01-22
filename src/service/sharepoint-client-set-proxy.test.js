import { getGraphClient } from '~/src/service/sharepoint-client.js'

jest.mock('~/src/config/index.js', () => ({
  config: {
    get: jest.fn((key) => {
      if (key === 'httpProxy') return 'http://localhost:8000'
      return {
        tenantId: '6f504113-6b64-43f2-ade9-242e05780007',
        clientId: 'dummy',
        clientSecret: 'dummy'
      }
    })
  }
}))

describe('sharepoint client', () => {
  describe('getGraphClient', () => {
    it('should return client when no proxy configured', () => {
      const client = getGraphClient()
      expect(client).toBeDefined()
    })
  })
})
