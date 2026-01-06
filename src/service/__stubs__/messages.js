/** @type {FormAdapterSubmissionMessage} */
export const messageForSharepointTest = {
  messageId: '547fff05-481f-43f5-85b7-7b994d636c01',
  meta: {
    schemaVersion: 1,
    timestamp: new Date('2026-01-06T13:05:51.322Z'),
    referenceNumber: '64C-345-5E6',
    formName: 'Test submit',
    formId: '6945710fb0136fc28df80d71',
    formSlug: 'test-submit',
    status: 'draft',
    isPreview: true,
    notificationEmail: 'jeremy.barnsley@esynergy.co.uk',
    versionMetadata: {
      versionNumber: 10,
      createdAt: new Date('2026-01-06T13:04:28.696Z')
    }
  },
  data: {
    main: { wVRKCI: 'John' },
    repeaters: {
      LAWQBm: [
        { jRCnMi: 'Apple', mtJFqE: { day: 1, month: 11, year: 2000 } },
        { jRCnMi: 'Banana', mtJFqE: { day: 21, month: 7, year: 1990 } }
      ]
    },
    files: {
      XpXizx: [
        {
          fileId: '02ce8776-15b2-4b9c-93a4-e7821cf7cc34',
          fileName: 'Some text in a doc file -here  ,   copy.doc',
          userDownloadLink:
            'http://host.docker.internal:3000/file-download/02ce8776-15b2-4b9c-93a4-e7821cf7cc34'
        },
        {
          fileId: 'a94cf9e6-122a-41cc-b8c2-2e34df800e92',
          fileName: 'test-logs 6.txt',
          userDownloadLink:
            'http://host.docker.internal:3000/file-download/a94cf9e6-122a-41cc-b8c2-2e34df800e92'
        }
      ]
    }
  },
  result: {
    files: {
      main: 'e62ca9d0-6924-4054-9c87-98d9a921fb78',
      repeaters: { LAWQBm: '' }
    }
  },
  recordCreatedAt: new Date('2026-01-06T13:05:55.743Z')
}

/**
 * @import { FormAdapterSubmissionMessage } from '@defra/forms-engine-plugin/engine/types.js'
 */
