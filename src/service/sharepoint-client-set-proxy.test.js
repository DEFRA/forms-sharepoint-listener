import {
  getGraphClient,
  proxyOptions
} from '~/src/service/sharepoint-client.js'

const proxyUrl = 'http://localhost:8000'

jest.mock('~/src/config/index.js', () => ({
  config: {
    get: jest.fn((key) => {
      if (key === 'httpProxy') return proxyUrl
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
    it('should return client when proxy configured', () => {
      const client = getGraphClient()
      expect(client).toBeDefined()
      // @ts-expect-error - config is private
      expect(client.config).toBeDefined()
    })
  })

  it('should return proxy options when proxy configured', () => {
    const options = proxyOptions(proxyUrl)
    expect(options).toEqual({
      proxyOptions: {
        host: 'http://localhost:8000/',
        password: '',
        port: 8000,
        username: ''
      }
    })
  })
})
