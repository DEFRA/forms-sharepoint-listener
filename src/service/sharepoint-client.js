import { ClientSecretCredential } from '@azure/identity'
import { Client } from '@microsoft/microsoft-graph-client'
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/lib/src/authentication/azureTokenCredentials/TokenCredentialAuthenticationProvider.js'

import { config } from '~/src/config/index.js'

const sharepointConfig = config.get('sharepoint')

const proxyUrlConfig = /** @type { string | null } */ (config.get('httpProxy'))

/**
 * @param {string | null} proxyConfig - proxy url from config
 * @returns {{ proxyOptions: { host: string, port: number, username: string, password: string }} | undefined }
 */
export function proxyOptions(proxyConfig) {
  if (!proxyConfig) {
    return undefined
  }
  const url = new URL(proxyConfig)
  return {
    proxyOptions: {
      host: url.href,
      port: Number(url.port),
      username: url.username,
      password: url.password
    }
  }
}

const credential = new ClientSecretCredential(
  sharepointConfig.tenantId,
  sharepointConfig.clientId,
  sharepointConfig.clientSecret,
  proxyOptions(proxyUrlConfig)
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
    authProvider
  })
}

/**
 * @import { FetchOptions } from '@microsoft/microsoft-graph-client'
 */
