import { formAdapterSubmissionMessagePayloadSchema } from '@defra/forms-engine-plugin/engine/types/schema.js'
import { getErrorMessage } from '@defra/forms-model'
import Joi from 'joi'

import { createLogger } from '~/src/helpers/logging/logger.js'
import { deleteEventMessage } from '~/src/messaging/event.js'

const logger = createLogger()

/**
 * @param {Message} message
 * @returns {FormAdapterSubmissionMessage}
 */
export function mapFormAdapterSubmissionEvent(message) {
  if (!message.MessageId) {
    throw new Error('Unexpected missing Message.MessageId')
  }

  if (!message.Body) {
    throw new Error('Unexpected empty Message.Body')
  }

  /**
   * @type {FormAdapterSubmissionMessagePayload}
   */
  const messageBody = JSON.parse(message.Body)

  const value = Joi.attempt(
    messageBody,
    formAdapterSubmissionMessagePayloadSchema,
    {
      abortEarly: false,
      stripUnknown: true
    }
  )

  return {
    messageId: message.MessageId,
    ...value,
    recordCreatedAt: new Date()
  }
}

/**
 * @param {unknown} error
 */
export function appendInnerError(error) {
  let body
  try {
    // @ts-expect-error - property may exists or not
    body = JSON.parse(error?.body)
  } catch {}

  return body?.innerError ? ` : ${JSON.stringify(body.innerError)}` : ''
}

/**
 * Create form submission event
 * @template T
 * @param {Message[]} messages
 * @param {T & FormAdapterSubmissionService} formSubmissionService
 * @returns {Promise<{ saved: FormAdapterSubmissionMessage[]; failed: any[] }>}
 */
export async function handleFormSubmissionEvents(
  messages,
  formSubmissionService
) {
  logger.info('Handling form submission events')
  /**
   * @param {Message} message
   * @returns {Promise<FormAdapterSubmissionMessage>}
   */
  async function handleSingleSubmissionEvent(message) {
    try {
      const submissionBody = mapFormAdapterSubmissionEvent(message)

      await formSubmissionService.handleFormSubmission(submissionBody)

      logger.info(`Deleting ${message.MessageId}`)

      await deleteEventMessage(message)

      logger.info(`Deleted ${message.MessageId}`)

      return submissionBody
    } catch (err) {
      const errText = `[handleFormSubmissionEvents] Failed to handle message - ${getErrorMessage(err)}${appendInnerError(err)}`
      logger.error(err, errText)
      throw err
    }
  }

  const results = await Promise.allSettled(
    messages.map(handleSingleSubmissionEvent)
  )

  const saved = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value)
  const savedMessage = saved.map((item) => item.meta.referenceNumber).join(',')

  logger.info(`Handled form submission event: ${savedMessage}`)

  const failed = results
    .filter((result) => result.status === 'rejected')
    .map((result) => result.reason)

  if (failed.length) {
    const failedMessage = failed.map((item) => getErrorMessage(item)).join(',')

    logger.info(`Failed to handle form submission event: ${failedMessage}`)
  }

  return { saved, failed }
}

/**
 * @import { Message } from '@aws-sdk/client-sqs'
 * @import { FormAdapterSubmissionMessage, FormAdapterSubmissionMessagePayload, FormAdapterSubmissionService } from '@defra/forms-engine-plugin/engine/types.js'
 */
