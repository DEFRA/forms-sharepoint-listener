import { ClientSecretCredential } from '@azure/identity'
import { Client } from '@microsoft/microsoft-graph-client'
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/lib/src/authentication/azureTokenCredentials/TokenCredentialAuthenticationProvider.js'
import { ProxyAgent } from 'undici'

import { config } from '~/src/config/index.js'

const sharepointConfig = config.get('sharepoint')

const proxyUrlConfig = /** @type { string | null } */ (config.get('httpProxy'))

/**
 * @param {string | null} proxyConfig - proxy url from config
 * @returns {{ proxyOptions: { host: string, port: number }} | undefined }
 */
function getProxy(proxyConfig) {
  if (!proxyConfig) {
    return undefined
  }
  const proxyUrl = new URL(proxyConfig)
  const port = Number.parseInt(proxyUrl.port)
  return {
    proxyOptions: {
      host: proxyUrl.href,
      port
    }
  }
}

/**
 * @param {string | null} proxyConfig - proxy url from config
 * @returns {FetchOptions} | {} }
 */
function getFetchOptions(proxyConfig) {
  return proxyConfig
    ? /** @type {FetchOptions} */ ({
        dispatcher: new ProxyAgent({
          uri: proxyConfig,
          keepAliveTimeout: 10,
          keepAliveMaxTimeout: 10
        })
      })
    : {}
}

const credential = new ClientSecretCredential(
  sharepointConfig.tenantId,
  sharepointConfig.clientId,
  sharepointConfig.clientSecret,
  getProxy(proxyUrlConfig)
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
    fetchOptions: getFetchOptions(proxyUrlConfig)
  })
}

/**
 * @import { FetchOptions } from '@microsoft/microsoft-graph-client'
 */
