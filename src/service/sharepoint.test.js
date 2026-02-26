import {
  buildMonthYearFieldComponent,
  buildTextFieldComponent
} from '@defra/forms-model/stubs'

import { getFormDefinition } from '~/src/lib/manager.js'
import { definitionForSharepointTest } from '~/src/service/__stubs__/forms.js'
import { messageForSharepointTest } from '~/src/service/__stubs__/messages.js'
import {
  addItemsByFieldName,
  addPaymentFields,
  componentValueMapper,
  createMapOfComponentNameToShortDesc,
  getValue,
  loadFormMappings,
  mapFieldNames,
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

const fieldNameMappings = [
  {
    name: 'Autocompletefield',
    displayName: 'Autocomplete field'
  },
  {
    name: 'Checkboxesfield',
    displayName: 'Checkboxes field'
  },
  {
    name: 'Dateofbirth1',
    displayName: 'Date of birth 1'
  },
  {
    name: 'Dateofbirth2',
    displayName: 'Date of birth 2'
  },
  {
    name: 'Datepartsfield',
    displayName: 'Date parts field'
  },
  {
    name: 'Declarationquestion',
    displayName: 'Declaration question'
  },
  {
    name: 'Eastingandnorthing',
    displayName: 'Easting and northing'
  },
  {
    name: 'Emailaddress',
    displayName: 'Email address'
  },
  {
    name: 'Favouritefruit1',
    displayName: 'Favourite fruit 1'
  },
  {
    name: 'Favouritefruit2',
    displayName: 'Favourite fruit 2'
  },
  {
    name: 'Monthandyear',
    displayName: 'Month and year'
  },
  {
    name: 'Multiline',
    displayName: 'Multiline'
  },
  {
    name: 'Number',
    displayName: 'Number'
  },
  {
    name: 'Paymentamount',
    displayName: 'Payment amount'
  },
  {
    name: 'Paymentdate',
    displayName: 'Payment date'
  },
  {
    name: 'Paymentdescription',
    displayName: 'Payment description'
  },
  {
    name: 'Paymentreference',
    displayName: 'Payment reference'
  },
  {
    name: 'Phonenumber',
    displayName: 'Phone number'
  },
  {
    name: 'Radiosfield',
    displayName: 'Radios field'
  },
  {
    name: 'Referencenumber',
    displayName: 'Reference number'
  },
  {
    name: 'Selectfield',
    displayName: 'Select field'
  },
  {
    name: 'Submissiondate',
    displayName: 'Submission date'
  },
  {
    name: 'Submissiontype',
    displayName: 'Submission type'
  },
  {
    name: 'Textfield',
    displayName: 'Text field'
  },
  {
    name: 'UKaddressfield',
    displayName: 'UK address field'
  },
  {
    name: 'Yesorno',
    displayName: 'Yes or no'
  },
  {
    name: 'Yourfile',
    displayName: 'Your file'
  }
]

const mockClientPostCall = jest.fn()
jest.mock('~/src/service/sharepoint-client.js', () => {
  const mockClientApiCall = {
    post: (/** @type {Map<string, string>} */ fields) =>
      mockClientPostCall(fields),
    get: () => Promise.resolve({ value: fieldNameMappings })
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
          Paymentamount: 150,
          Paymentdate: '2026-01-26T14:30:00.000Z',
          Paymentdescription: 'payment description',
          Paymentreference: 'payment-ref',
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

    it('should construct correct data from message to send to sharepoint - some fields empty', async () => {
      jest
        .mocked(getFormDefinition)
        .mockResolvedValue(definitionForSharepointTest)
      const message = structuredClone(messageForSharepointTest)
      message.meta.formId = 'my-form-id'
      message.data.main.aDDfeH = undefined
      message.data.main.GesUIU = undefined

      await saveToSharepointList(message)
      expect(mockClientPostCall).toHaveBeenCalledWith({
        fields: {
          Autocompletefield: 'Autocomplete 2',
          Checkboxesfield: 'Item 2',
          Datepartsfield: new Date(2026, 11, 12),
          Declarationquestion: 'I understand and agree',
          Eastingandnorthing: '',
          Emailaddress: 'email1@testing.co.uk',
          Dateofbirth1: new Date(2000, 10, 1),
          Dateofbirth2: new Date(1990, 6, 21),
          Favouritefruit1: 'Apple',
          Favouritefruit2: 'Banana',
          Monthandyear: '',
          Multiline: `multiline line 1
line 2
line 3`,
          Number: 12345,
          Paymentamount: 150,
          Paymentdate: '2026-01-26T14:30:00.000Z',
          Paymentdescription: 'payment description',
          Paymentreference: 'payment-ref',
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
          Paymentamount: 150,
          Paymentdate: '2026-01-26T14:30:00.000Z',
          Paymentdescription: 'payment description',
          Paymentreference: 'payment-ref',
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

  describe('addPaymentFields', () => {
    it('should add payment fields', () => {
      /** @type {Map<string, CellValue >} */
      const fields = new Map()
      addPaymentFields(messageForSharepointTest, fields)
      const fieldsArray = Array.from(fields.entries())
      expect(fieldsArray).toEqual([
        ['Payment description', 'payment description'],
        ['Payment amount', 150],
        ['Payment reference', 'payment-ref'],
        ['Payment date', '2026-01-26T14:30:00.000Z']
      ])
    })
    it('should ignore if no payment fields', () => {
      /** @type {Map<string, CellValue >} */
      const fields = new Map()
      const message = structuredClone(messageForSharepointTest)
      message.data.payment = undefined
      addPaymentFields(message, fields)
      const fieldsArray = Array.from(fields.entries())
      expect(fieldsArray).toEqual([])
    })
  })

  describe('mapFieldNames', () => {
    it('should throw if field name not found', () => {
      const fields = new Map()
      fields.set('field 1', 'val1')
      fields.set('field 2', 'val2')
      fields.set('field 3', 'val3')
      const mapOfNames = new Map()
      mapOfNames.set('field 1', 'field1')
      mapOfNames.set('field 3', 'field3')
      expect(() => mapFieldNames(fields, mapOfNames)).toThrow(
        "Internal name not found for display name 'field 2'"
      )
    })
  })

  describe('componentValueMapper', () => {
    it('should handle month requiring leading zero when Month/Year', () => {
      const component = buildMonthYearFieldComponent()
      const value = { year: 2026, month: 2 }
      expect(componentValueMapper(component, value)).toBe('2026/02')
    })
  })

  describe('getValue', () => {
    it('should handle key not in data', () => {
      const data = {
        abcdef: 'val1'
      }
      const component = buildTextFieldComponent()
      expect(getValue(data, 'abcxxx', component)).toBeUndefined()
    })
  })

  describe('createMapOfComponentNameToShortDesc', () => {
    it('should handle missing short desc', () => {
      const badDefinition = {
        ...definitionForSharepointTest
      }
      // @ts-expect-error - no need to coalesce for tests
      delete badDefinition.pages[0].components[1].shortDescription
      const map = createMapOfComponentNameToShortDesc(
        definitionForSharepointTest
      )
      expect(map).toBeDefined()
      expect(map.get('--missing-short-desc--')).toBe('')
    })
  })
})

/**
 * @import { PageQuestion } from '@defra/forms-model'
 * @import { CellValue } from '~/src/service/sharepoint.js'
 */
