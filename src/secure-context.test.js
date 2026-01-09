import { getTrustStoreCerts } from '~/src/helpers/secure-context/get-trust-store-certs.js'
import { prepareSecureContext } from '~/src/secure-context.js'

jest.mock('~/src/helpers/secure-context/get-trust-store-certs.js')

describe('prepareSecureContext', () => {
  const mockLogInfo = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should log if no certs found', () => {
    /** @type {Server} */
    const mockServer = {
      // @ts-expect-error - only partial mock
      logger: {
        info: mockLogInfo
      }
    }
    jest.mocked(getTrustStoreCerts).mockReturnValueOnce([])
    const context = prepareSecureContext(mockServer)
    expect(context).toBeDefined()
    expect(mockLogInfo).toHaveBeenCalledWith(
      'Could not find any TRUSTSTORE_ certificates'
    )
  })

  test('should create secure context', () => {
    jest
      .mocked(getTrustStoreCerts)
      .mockReturnValueOnce(['abc'])
      .mockReturnValueOnce(['abc'])
    /** @type {Server} */
    const mockServer = {
      // @ts-expect-error - only partial mock
      logger: {
        info: mockLogInfo
      }
    }
    const context = prepareSecureContext(mockServer)
    expect(context).toBeDefined()
    expect(mockLogInfo).not.toHaveBeenCalled()
  })
})

/**
 * @import { Server } from '@hapi/hapi'
 */
