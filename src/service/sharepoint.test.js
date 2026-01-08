import { getFormDefinition } from '~/src/lib/manager.js'
import { definitionForSharepointTest } from '~/src/service/__stubs__/forms.js'
import { messageForSharepointTest } from '~/src/service/__stubs__/messages.js'
import {
  addItemsByFieldName,
  escapeFieldName,
  saveToSharepointList
} from '~/src/service/sharepoint.js'

jest.mock('~/src/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  })
}))
jest.mock('~/src/lib/manager.js')

const mockClientPostCall = jest.fn()
jest.mock('~/src/service/sharepoint-client.js', () => {
  const mockClientApiCall = {
    post: (/** @type {Map<string, string>} */ fields) =>
      mockClientPostCall(fields)
  }
  const mockClientApi = {
    api: () => mockClientApiCall
  }
  return {
    getGraphClient: jest.fn(() => mockClientApi)
  }
})

describe('sharepoint', () => {
  const siteId = 'my-site-id'
  const listId = 'my-list-id'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('addItemsByFieldName', () => {
    it('should send correct API call', async () => {
      /** @type {Map<string, string>} */
      const fields = new Map()
      fields.set('field1', 'value1')
      await addItemsByFieldName(siteId, listId, fields)
      expect(mockClientPostCall).toHaveBeenCalledWith({
        fields: {
          field1: 'value1'
        }
      })
    })
  })

  describe('saveToSharepointList', () => {
    it('should ignore if not an allowed form id', async () => {
      jest
        .mocked(getFormDefinition)
        .mockResolvedValue(definitionForSharepointTest)
      await saveToSharepointList(messageForSharepointTest)
      expect(mockClientPostCall).not.toHaveBeenCalled()
    })

    it('should construct correct data from message to send to sharepoint', async () => {
      jest
        .mocked(getFormDefinition)
        .mockResolvedValue(definitionForSharepointTest)
      const message = structuredClone(messageForSharepointTest)
      message.meta.formId = 'my-form-id'
      await saveToSharepointList(message)
      expect(mockClientPostCall).toHaveBeenCalledWith({
        fields: {
          Autocompletefield: 'Autocomplete 2',
          Checkboxesfield: 'Item 2',
          Datepartsfield: new Date(2026, 11, 12),
          Declarationquestion: 'I understand and agree',
          Emailaddress: 'email1@testing.co.uk',
          Dateofbirth1: new Date(2000, 10, 1),
          Dateofbirth2: new Date(1990, 6, 21),
          Favouritefruit1: 'Apple',
          Favouritefruit2: 'Banana',
          Monthandyear: new Date(2026, 9, 1),
          Multiline: `multiline line 1
line 2
line 3`,
          Number: 12345,
          Phonenumber: '+441234123456',
          Radiosfield: 'Radio 1',
          Selectfield: 'Select option 2',
          Submissiondate: new Date('2026-01-06T13:05:51.322Z'),
          Textfield: 'John Smith',
          UKaddressfield: '1 Test Street, Testington, TS1 1TS',
          Yesorno: 'Yes',
          Yourfile:
            'http://host.docker.internal:3000/file-download/02ce8776-15b2-4b9c-93a4-e7821cf7cc34 \r\nhttp://host.docker.internal:3000/file-download/a94cf9e6-122a-41cc-b8c2-2e34df800e92'
        }
      })
    })
  })

  describe('escapeFieldName', () => {
    it('should translate name as appropriate', () => {
      expect(escapeFieldName(undefined)).toBe('')
      expect(escapeFieldName('')).toBe('')
      expect(escapeFieldName('abc DEF')).toBe('abcDEF')
      expect(escapeFieldName('abcd   GHI')).toBe('abcdGHI')
    })
  })
})
