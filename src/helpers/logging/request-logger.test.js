import { requestLogger } from '~/src/helpers/logging/request-logger.js'

const RESPONSE_TIME = 20

describe('request-logger', () => {
  it('should log requests', () => {
    const oid = '9c145f66-0ce8-435f-a6aa-f1f0041baebc'
    expect(
      requestLogger.options.customRequestCompleteMessage(
        {
          method: 'GET',
          path: '/audit/forms/12121212',
          raw: {
            res: {
              statusCode: 200
            }
          },
          auth: {
            isAuthenticated: true,
            credentials: {
              user: {
                oid
              }
            }
          }
        },
        RESPONSE_TIME
      )
    ).toBe(
      '[response] [9c145f66-0ce8-435f-a6aa-f1f0041baebc]  GET /audit/forms/12121212 200 (20ms)'
    )
  })

  it('should log requests 2', () => {
    expect(
      requestLogger.options.customRequestCompleteMessage(
        {
          method: 'GET',
          path: '/audit/forms/12121212',
          raw: {
            res: {
              statusCode: 200
            }
          },
          auth: {
            isAuthenticated: true,
            credentials: {
              user: {}
            }
          }
        },
        RESPONSE_TIME
      )
    ).toBe('[response] GET /audit/forms/12121212 200 (20ms)')
  })
})
