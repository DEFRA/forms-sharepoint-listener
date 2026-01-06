import { postJson } from '~/src/lib/fetch.js'

/**
 * @typedef {{
 *   templateId: string
 *   emailAddress: string
 *   personalisation: { subject: string; body: string }
 *   notifyReplyToId?: string
 * }} SendNotificationArgs
 */

/**
 * Notify auto-translates ASCII hyphens to en dashes, and strips whitespace (including tabs) before punctuation.
 * This method is used to escape each of these characters so Notify doesn't translate the content.
 * @param {string} str
 */
export function escapeNotifyContent(str) {
  return str
    .replaceAll('-', '&hyphen;')
    .replaceAll(' ', '&nbsp;')
    .replaceAll('\t', '&nbsp;&nbsp;&nbsp;&nbsp;')
}

/**
 * @param {{ subject: string; body: string }} personalisation
 */
export function escapeNotifyPersonalisation(personalisation) {
  const { subject, body } = personalisation
  // Dont escape the subject line as this doesn't render in an HTML-like way
  return {
    subject,
    body: escapeNotifyContent(body)
  }
}

/**
 * @param {string} _iss
 * @param {string} _secret
 */
function createToken(_iss, _secret) {
  return 'dummy'
}

const NOTIFICATIONS_URL = new URL(
  '/v2/notifications/email',
  'https://api.notifications.service.gov.uk'
)

/**
 * @param {SendNotificationArgs} args
 * @returns {Promise<{response: object, body: unknown}>}
 */
export async function sendNotification(args) {
  const { templateId, emailAddress, personalisation, notifyReplyToId } = args

  const escapedPersonalisation = escapeNotifyPersonalisation(personalisation)

  return postJson(NOTIFICATIONS_URL, {
    payload: {
      template_id: templateId,
      email_address: emailAddress,
      personalisation: escapedPersonalisation,
      email_reply_to_id: notifyReplyToId
    },
    headers: {
      Authorization: 'Bearer ' + createToken('serviceId', 'apiKeyId')
    }
  })
}
