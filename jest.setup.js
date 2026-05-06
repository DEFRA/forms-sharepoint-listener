process.env.NODE_ENV = 'test'
process.env.HOST = '0.0.0.0'
process.env.PORT = '3007'
process.env.SERVICE_VERSION = 'test'
process.env.ENVIRONMENT = 'test'

process.env.MANAGER_URL = 'http://manager'
process.env.OIDC_JWKS_URI =
  'https://login.microsoftonline.com/770a2450-0227-4c62-90c7-4e38537f1102/discovery/v2.0/keys'
process.env.SHAREPOINT_TENANT_ID = '6f504113-6b64-43f2-ade9-242e05780007'
process.env.SHAREPOINT_CLIENT_ID = 'dummy'
process.env.SHAREPOINT_CLIENT_SECRET = 'dummy'
process.env.SHAREPOINT_FORM_MAPPINGS =
  '{"mappings":[{"formId":"my-form-id","siteId":"my-site-id","listId":"my-list-id","status":"draft"}]}'

process.env.LOG_ENABLED = 'false'
process.env.LOG_LEVEL = 'debug'
process.env.LOG_FORMAT = 'pino-pretty'

process.env.HTTP_PROXY = ''
process.env.CDP_HTTPS_PROXY = ''

process.env.ENABLE_SECURE_CONTEXT = 'false'
process.env.ENABLE_METRICS = 'false'
process.env.TRACING_HEADER = 'x-cdp-request-id'

process.env.AWS_REGION = 'eu-west-2'
process.env.SQS_ENDPOINT = 'http://localhost:4566'
process.env.EVENTS_SQS_QUEUE_URL =
  'http://sqs.eu-west-2.127.0.0.1:4566/000000000000/forms_sharepoint_listener_events'
process.env.EVENTS_SQS_DLQ_ARN =
  'arn:aws:sqs:eu-west-2:000000000000:forms_sharepoint_listener_events-deadletter'
process.env.RECEIVE_MESSAGE_TIMEOUT_MS = '5000'
process.env.SQS_MAX_NUMBER_OF_MESSAGES = '10'
process.env.SQS_VISIBILITY_TIMEOUT = '30'
