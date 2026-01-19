import { getFormDefinition } from '~/src/lib/manager.js'
import { definitionForSharepointTest } from '~/src/service/__stubs__/forms.js'
import { messageForSharepointTest } from '~/src/service/__stubs__/messages.js'
import {
  addItemsByFieldName,
  escapeFieldName,
  loadFormMappings,
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
          Eastingandnorthing: 'Easting: 12345, Northing: 67890',
          Emailaddress: 'email1@testing.co.uk',
          Dateofbirth1: new Date(2000, 10, 1),
          Dateofbirth2: new Date(1990, 6, 21),
          Favouritefruit1: 'Apple',
          Favouritefruit2: 'Banana',
          Monthandyear: '2026/10',
          Multiline: `multiline line 1
line 2
line 3`,
          Number: 12345,
          Phonenumber: '+441234123456',
          Radiosfield: 'Radio 1',
          Selectfield: 'Select option 2',
          Submissiondate: new Date('2026-01-06T13:05:51.322Z'),
          Submissiontype: 'Preview',
          Textfield: 'John Smith',
          UKaddressfield: '1 Test Street, Testington, TS1 1TS',
          Yesorno: 'Yes',
          Yourfile:
            'http://host.docker.internal:3000/file-download/02ce8776-15b2-4b9c-93a4-e7821cf7cc34 \r\nhttp://host.docker.internal:3000/file-download/a94cf9e6-122a-41cc-b8c2-2e34df800e92'
        }
      })
    })

    it('should construct correct data from message including reference number', async () => {
      const definitionWithRefNum = structuredClone(definitionForSharepointTest)
      definitionWithRefNum.options = { showReferenceNumber: true }
      jest.mocked(getFormDefinition).mockResolvedValue(definitionWithRefNum)
      const message = structuredClone(messageForSharepointTest)
      message.meta.formId = 'my-form-id'
      await saveToSharepointList(message)
      expect(mockClientPostCall).toHaveBeenCalledWith({
        fields: {
          Autocompletefield: 'Autocomplete 2',
          Checkboxesfield: 'Item 2',
          Datepartsfield: new Date(2026, 11, 12),
          Declarationquestion: 'I understand and agree',
          Eastingandnorthing: 'Easting: 12345, Northing: 67890',
          Emailaddress: 'email1@testing.co.uk',
          Dateofbirth1: new Date(2000, 10, 1),
          Dateofbirth2: new Date(1990, 6, 21),
          Favouritefruit1: 'Apple',
          Favouritefruit2: 'Banana',
          Monthandyear: '2026/10',
          Multiline: `multiline line 1
line 2
line 3`,
          Number: 12345,
          Phonenumber: '+441234123456',
          Radiosfield: 'Radio 1',
          Referencenumber: '64C-345-5E6',
          Selectfield: 'Select option 2',
          Submissiondate: new Date('2026-01-06T13:05:51.322Z'),
          Submissiontype: 'Preview',
          Textfield: 'John Smith',
          UKaddressfield: '1 Test Street, Testington, TS1 1TS',
          Yesorno: 'Yes',
          Yourfile:
            'http://host.docker.internal:3000/file-download/02ce8776-15b2-4b9c-93a4-e7821cf7cc34 \r\nhttp://host.docker.internal:3000/file-download/a94cf9e6-122a-41cc-b8c2-2e34df800e92'
        }
      })
    })

    it('should throw if repeater name will blow limits', async () => {
      const definition = structuredClone(definitionForSharepointTest)
      const page = /** @type {PageQuestion} */ (definition.pages[2])
      const component = /** @type {TextFieldComponent} */ (page.components[0])
      component.shortDescription = 'Repeater Name That Is Too Long Herexx'
      jest.mocked(getFormDefinition).mockResolvedValue(definition)
      const message = structuredClone(messageForSharepointTest)
      message.meta.formId = 'my-form-id'
      await expect(() => saveToSharepointList(message)).rejects.toThrow(
        'Repeater columns plus number index cannot be longer than 32 characters (with spaces stripped) - shortDesc: RepeaterNameThatIsTooLongHerexx15 formId: my-form-id'
      )
    })
  })

  describe('escapeFieldName', () => {
    it('should translate name as appropriate', () => {
      expect(escapeFieldName(undefined)).toBe('')
      expect(escapeFieldName('')).toBe('')
      expect(escapeFieldName('abc DEF')).toBe('abcDEF')
      expect(escapeFieldName('abcd   GHI')).toBe('abcdGHI')
      expect(escapeFieldName("abc-DE'F")).toBe('abc_x002d_DEF')
    })
  })

  describe('loadFormMappings', () => {
    it('should validate ok with empty array', () => {
      const res = loadFormMappings('{"mappings":[]}')
      expect(res).toEqual([])
    })

    it('should validate ok with two rows in array', () => {
      const res = loadFormMappings(
        '{"mappings":[{"formId":"695e4ec0e57ae17190adacba","siteId":"071a12a4-5ed0-4a08-bbf6-93a762e89bdb","listId":"0695483b-f344-419f-bc93-ee8aeee1b788","status":"draft"},{"formId":"696104cfab2e01c384cf6382","siteId":"071a12a4-5ed0-4a08-bbf6-93a762e89bdb","listId":"69c339f4-5c06-42ab-89f9-7db121c61fc3","status":"draft"}]}'
      )
      expect(res).toEqual([
        {
          formId: '695e4ec0e57ae17190adacba',
          siteId: '071a12a4-5ed0-4a08-bbf6-93a762e89bdb',
          listId: '0695483b-f344-419f-bc93-ee8aeee1b788',
          status: 'draft'
        },
        {
          formId: '696104cfab2e01c384cf6382',
          siteId: '071a12a4-5ed0-4a08-bbf6-93a762e89bdb',
          listId: '69c339f4-5c06-42ab-89f9-7db121c61fc3',
          status: 'draft'
        }
      ])
    })

    it('should throw if invalid config', () => {
      expect(() => loadFormMappings('{"mappingsxx":{}}')).toThrow(
        'Invalid Sharepoint form mappings config - "mappingsxx" is not allowed : {"mappingsxx":{}}'
      )
    })
  })
})

/**
 * @import { PageQuestion, TextFieldComponent } from '@defra/forms-model'
 */
