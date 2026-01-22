import { ClientSecretCredential } from '@azure/identity'
import { Client } from '@microsoft/microsoft-graph-client'
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/lib/src/authentication/azureTokenCredentials/TokenCredentialAuthenticationProvider.js'
import { ProxyAgent } from 'undici'

import { config } from '~/src/config/index.js'

const sharepointConfig = config.get('sharepoint')

const proxyUrlConfig = /** @type { string | null } */ (config.get('httpProxy'))
const proxyUrl = proxyUrlConfig
  ? new URL(proxyUrlConfig)
  : new URL('http://localhost:8010')
const proxyPort = Number.parseInt(proxyUrl.port)
const proxyOptionsBlock = proxyUrlConfig
  ? {
      proxyOptions: {
        host: proxyUrl.href,
        port: proxyPort
      }
    }
  : {}

const fetchOptionsBlock = proxyUrlConfig
  ? /** @type {FetchOptions} */ ({
      dispatcher: new ProxyAgent({
        uri: proxyUrlConfig,
        keepAliveTimeout: 10,
        keepAliveMaxTimeout: 10
      })
    })
  : {}

const credential = new ClientSecretCredential(
  sharepointConfig.tenantId,
  sharepointConfig.clientId,
  sharepointConfig.clientSecret,
  proxyOptionsBlock
)

const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  scopes: ['https://graph.microsoft.com/.default']
})

/**
 * Creates an MS Graph client
 * @returns {Client}
 */
export function getGraphClient() {
  return Client.initWithMiddleware({
    authProvider,
    fetchOptions: fetchOptionsBlock
  })
}

/**
 * @import { FetchOptions } from '@microsoft/microsoft-graph-client'
 */
