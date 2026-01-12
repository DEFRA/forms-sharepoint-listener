import { handleFormSubmissionEvents } from '~/src/service/events.js'
import { saveToSharepointList } from '~/src/service/sharepoint.js'

/**
 * @param {Message[]} messages
 * @returns {Promise<{saved: FormAdapterSubmissionMessage[]; failed: any[]}>}
 */
export async function handleEvent(messages) {
  const service = {
    handleFormSubmission: saveToSharepointList
  }
  return handleFormSubmissionEvents(messages, service)
}

/**
 * @import { Message } from '@aws-sdk/client-sqs'
 * @import { FormAdapterSubmissionMessage } from '@defra/forms-engine-plugin/engine/types.js'
 */
