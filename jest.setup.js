import nock from 'nock'

process.env.MANAGER_URL = 'http://manager'
process.env.OIDC_JWKS_URI = 'https://oidc.test/.well-known/jwks.json'
process.env.SHAREPOINT_TENANT_ID = '6f504113-6b64-43f2-ade9-242e05780007'
process.env.SHAREPOINT_CLIENT_ID = 'dummy'
process.env.SHAREPOINT_CLIENT_SECRET = 'dummy'
process.env.SHAREPOINT_FORM_MAPPINGS =
  '{"mappings":[{"formId":"my-form-id","siteId":"my-site-id","listId":"my-list-id","status":"draft"}]}'

const jwks = {
  keys: [
    {
      alg: 'RS256',
      e: 'AQAB',
      kid: '9tuAErwpIu41FajLxmC9+8Y7kMXa0kO3sY=',
      kty: 'RSA',
      n: 'q3DaFfvNA0C8wOaVsx-P68LqF4U5NzQuz9',
      use: 'sig'
    }
  ]
}

nock('https://oidc.test')
  .persist()
  .get('/.well-known/jwks.json')
  .reply(200, jwks)
