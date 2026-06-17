import {
  buildMonthYearFieldComponent,
  buildTextFieldComponent
} from '@defra/forms-model/stubs'

import { getFormDefinition } from '~/src/lib/manager.js'
import { definitionForSharepointTest } from '~/src/service/__stubs__/forms.js'
import { messageForSharepointTest } from '~/src/service/__stubs__/messages.js'
import {
  addItemsByFieldName,
  getColumnPropertiesFromGraph
} from '~/src/service/ms-graph.js'
import {
  addBaseFields,
  addPaymentFields,
  componentValueMapper,
  createMapOfColumnProperties,
  createMapOfComponentNameToShortDesc,
  datatypeGuard,
  getJsDatatype,
  getSharepointDatatype,
  getValue,
  loadFormMappings,
  mapFieldNames,
  saveToSharepointList
} from '~/src/service/sharepoint.js'

jest.mock('~/src/helpers/logging/logger.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}))
jest.mock('~/src/lib/manager.js')
jest.mock('~/src/service/ms-graph.js')

const fieldNameMappings = [
  {
    name: 'Autocompletefield',
    displayName: 'Autocomplete field',
    text: {}
  },
  {
    name: 'Checkboxesfield',
    displayName: 'Checkboxes field',
    text: {}
  },
  {
    name: 'Dateofbirth1',
    displayName: 'Date of birth 1',
    dateTime: {}
  },
  {
    name: 'Dateofbirth2',
    displayName: 'Date of birth 2',
    dateTime: {}
  },
  {
    name: 'Datepartsfield',
    displayName: 'Date parts field',
    dateTime: {}
  },
  {
    name: 'Declarationquestion',
    displayName: 'Declaration question',
    text: {}
  },
  {
    name: 'Eastingandnorthing',
    displayName: 'Easting and northing',
    text: {}
  },
  {
    name: 'Emailaddress',
    displayName: 'Email address',
    text: {}
  },
  {
    name: 'Favouritefruit1',
    displayName: 'Favourite fruit 1',
    text: {}
  },
  {
    name: 'Favouritefruit2',
    displayName: 'Favourite fruit 2',
    text: {}
  },
  {
    name: 'Leadingspacetextfield',
    displayName: 'Leading space text field',
    text: {}
  },
  {
    name: 'Monthandyear',
    displayName: 'Month and year',
    text: {}
  },
  {
    name: 'Multiline',
    displayName: 'Multiline',
    text: {}
  },
  {
    name: 'Number',
    displayName: 'Number',
    number: {}
  },
  {
    name: 'Paymentamount',
    displayName: 'Payment amount',
    number: {}
  },
  {
    name: 'Paymentdate',
    displayName: 'Payment date',
    dateTime: {}
  },
  {
    name: 'Paymentdescription',
    displayName: 'Payment description',
    text: {}
  },
  {
    name: 'Paymentreference',
    displayName: 'Payment reference',
    text: {}
  },
  {
    name: 'Phonenumber',
    displayName: 'Phone number',
    text: {}
  },
  {
    name: 'Radiosfield',
    displayName: 'Radios field',
    text: {}
  },
  {
    name: 'Referencenumber',
    displayName: 'Reference number',
    text: {}
  },
  {
    name: 'Selectfield',
    displayName: 'Select field',
    text: {}
  },
  {
    name: 'Submissiondate',
    displayName: 'Submission date',
    dateTime: {}
  },
  {
    name: 'Submissiontype',
    displayName: 'Submission type',
    text: {}
  },
  {
    name: 'Textfield',
    displayName: 'Text field',
    text: {}
  },
  {
    name: 'UKaddressfield',
    displayName: 'UK address field',
    text: {}
  },
  {
    name: 'Yesorno',
    displayName: 'Yes or no',
    text: {}
  },
  {
    name: 'Yourfile',
    displayName: 'Your file',
    text: {}
  }
]

jest.mock('~/src/service/sharepoint-client.js', () => {
  return {
    getGraphClient: jest.fn()
  }
})

describe('sharepoint', () => {
  beforeEach(() => {
    jest
      .mocked(getColumnPropertiesFromGraph)
      .mockResolvedValue(fieldNameMappings)
    jest.clearAllMocks()
  })

  describe('saveToSharepointList', () => {
    it('should ignore if not an allowed form id', async () => {
      jest
        .mocked(getFormDefinition)
        .mockResolvedValue(definitionForSharepointTest)
      await saveToSharepointList(messageForSharepointTest)
      expect(addItemsByFieldName).not.toHaveBeenCalled()
    })

    it('should construct correct data from message to send to sharepoint', async () => {
      jest
        .mocked(getFormDefinition)
        .mockResolvedValue(definitionForSharepointTest)

      // @ts-expect-error - Map<string, CellValue>
      const expectedFields = new Map([
        ['Autocompletefield', 'Autocomplete 2'],
        ['Checkboxesfield', 'Item 2'],
        ['Datepartsfield', new Date(2026, 11, 12)],
        ['Declarationquestion', 'I understand and agree'],
        ['Eastingandnorthing', 'Easting: 12345, Northing: 67890'],
        ['Emailaddress', 'email1@testing.co.uk'],
        ['Dateofbirth1', new Date(2000, 10, 1)],
        ['Dateofbirth2', new Date(1990, 6, 21)],
        ['Favouritefruit1', 'Apple'],
        ['Favouritefruit2', 'Banana'],
        ['Leadingspacetextfield', 'Text with leading space in short desc'],
        ['Monthandyear', '2026/10'],
        [
          'Multiline',
          `multiline line 1
line 2
line 3`
        ],
        ['Number', 12345],
        ['Paymentamount', 150],
        ['Paymentdate', '2026-01-26T14:30:00.000Z'],
        ['Paymentdescription', 'payment description'],
        ['Paymentreference', 'payment-ref'],
        ['Phonenumber', '+441234123456'],
        ['Radiosfield', 'Radio 1'],
        ['Selectfield', 'Select option 2'],
        ['Submissiondate', new Date('2026-01-06T13:05:51.322Z')],
        ['Submissiontype', 'Preview'],
        ['Textfield', 'John Smith'],
        ['UKaddressfield', '1 Test Street, Testington, TS1 1TS'],
        ['Yesorno', 'Yes'],
        [
          'Yourfile',
          'http://host.docker.internal:3000/file-download/02ce8776-15b2-4b9c-93a4-e7821cf7cc34 \r\nhttp://host.docker.internal:3000/file-download/a94cf9e6-122a-41cc-b8c2-2e34df800e92'
        ]
      ])

      const message = structuredClone(messageForSharepointTest)
      message.meta.formId = 'my-form-id'
      await saveToSharepointList(message)
      expect(addItemsByFieldName).toHaveBeenCalledWith(
        undefined,
        'my-site-id',
        'my-list-id',
        expectedFields
      )
    })

    it('should construct correct data from message to send to sharepoint - empty fields omitted', async () => {
      jest
        .mocked(getFormDefinition)
        .mockResolvedValue(definitionForSharepointTest)
      const message = structuredClone(messageForSharepointTest)
      message.meta.formId = 'my-form-id'
      message.data.main.aDDfeH = undefined
      message.data.main.GesUIU = undefined

      // @ts-expect-error - Map<string, CellValue>
      const expectedFields = new Map([
        ['Autocompletefield', 'Autocomplete 2'],
        ['Checkboxesfield', 'Item 2'],
        ['Datepartsfield', new Date(2026, 11, 12)],
        ['Declarationquestion', 'I understand and agree'],
        ['Emailaddress', 'email1@testing.co.uk'],
        ['Dateofbirth1', new Date(2000, 10, 1)],
        ['Dateofbirth2', new Date(1990, 6, 21)],
        ['Favouritefruit1', 'Apple'],
        ['Favouritefruit2', 'Banana'],
        ['Leadingspacetextfield', 'Text with leading space in short desc'],
        [
          'Multiline',
          `multiline line 1
line 2
line 3`
        ],
        ['Number', 12345],
        ['Paymentamount', 150],
        ['Paymentdate', '2026-01-26T14:30:00.000Z'],
        ['Paymentdescription', 'payment description'],
        ['Paymentreference', 'payment-ref'],
        ['Phonenumber', '+441234123456'],
        ['Radiosfield', 'Radio 1'],
        ['Selectfield', 'Select option 2'],
        ['Submissiondate', new Date('2026-01-06T13:05:51.322Z')],
        ['Submissiontype', 'Preview'],
        ['Textfield', 'John Smith'],
        ['UKaddressfield', '1 Test Street, Testington, TS1 1TS'],
        ['Yesorno', 'Yes'],
        [
          'Yourfile',
          'http://host.docker.internal:3000/file-download/02ce8776-15b2-4b9c-93a4-e7821cf7cc34 \r\nhttp://host.docker.internal:3000/file-download/a94cf9e6-122a-41cc-b8c2-2e34df800e92'
        ]
      ])

      await saveToSharepointList(message)
      expect(addItemsByFieldName).toHaveBeenCalledWith(
        undefined,
        'my-site-id',
        'my-list-id',
        expectedFields
      )
    })

    it('should construct correct data from message including reference number and leading space in short desc', async () => {
      const definitionWithRefNum = structuredClone(definitionForSharepointTest)
      definitionWithRefNum.options = { showReferenceNumber: true }
      jest.mocked(getFormDefinition).mockResolvedValue(definitionWithRefNum)
      const message = structuredClone(messageForSharepointTest)
      message.meta.formId = 'my-form-id'

      // @ts-expect-error - Map<string, CellValue>
      const expectedFields = new Map([
        ['Autocompletefield', 'Autocomplete 2'],
        ['Checkboxesfield', 'Item 2'],
        ['Datepartsfield', new Date(2026, 11, 12)],
        ['Declarationquestion', 'I understand and agree'],
        ['Eastingandnorthing', 'Easting: 12345, Northing: 67890'],
        ['Emailaddress', 'email1@testing.co.uk'],
        ['Dateofbirth1', new Date(2000, 10, 1)],
        ['Dateofbirth2', new Date(1990, 6, 21)],
        ['Favouritefruit1', 'Apple'],
        ['Favouritefruit2', 'Banana'],
        ['Leadingspacetextfield', 'Text with leading space in short desc'],
        ['Monthandyear', '2026/10'],
        [
          'Multiline',
          `multiline line 1
line 2
line 3`
        ],
        ['Number', 12345],
        ['Paymentamount', 150],
        ['Paymentdate', '2026-01-26T14:30:00.000Z'],
        ['Paymentdescription', 'payment description'],
        ['Paymentreference', 'payment-ref'],
        ['Phonenumber', '+441234123456'],
        ['Radiosfield', 'Radio 1'],
        ['Referencenumber', '64C-345-5E6'],
        ['Selectfield', 'Select option 2'],
        ['Submissiondate', new Date('2026-01-06T13:05:51.322Z')],
        ['Submissiontype', 'Preview'],
        ['Textfield', 'John Smith'],
        ['UKaddressfield', '1 Test Street, Testington, TS1 1TS'],
        ['Yesorno', 'Yes'],
        [
          'Yourfile',
          'http://host.docker.internal:3000/file-download/02ce8776-15b2-4b9c-93a4-e7821cf7cc34 \r\nhttp://host.docker.internal:3000/file-download/a94cf9e6-122a-41cc-b8c2-2e34df800e92'
        ]
      ])

      await saveToSharepointList(message)
      expect(addItemsByFieldName).toHaveBeenCalledWith(
        undefined,
        'my-site-id',
        'my-list-id',
        expectedFields
      )
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
      mapOfNames.set('field 1', { name: 'field1' })
      mapOfNames.set('field 3', { name: 'field3' })
      expect(() => mapFieldNames(fields, mapOfNames)).toThrow(
        "Internal name not found for display name 'field 2'"
      )
    })

    it('should ignore if field key is undefined', () => {
      const fields = new Map()
      fields.set('field 1', 'val1')
      fields.set(undefined, 'val2')
      fields.set('field 3', 'val3')
      const mapOfNames = new Map()
      mapOfNames.set('field 1', { name: 'field1' })
      mapOfNames.set(undefined, { name: 'problem-field' })
      mapOfNames.set('field 3', { name: 'field3' })
      const res = mapFieldNames(fields, mapOfNames)
      expect(res).toEqual(
        new Map([
          ['field1', 'val1'],
          ['field3', 'val3']
        ])
      )
    })
  })

  describe('componentValueMapper', () => {
    it('should handle month requiring leading zero when Month/Year', () => {
      const component = /** @type {any} */ (buildMonthYearFieldComponent())
      const value = { year: 2026, month: 2 }
      expect(componentValueMapper(component, value)).toBe('2026/02')
    })
  })

  describe('getValue', () => {
    it('should handle key not in data', () => {
      const data = {
        abcdef: 'val1'
      }
      const component = /** @type {any} */ (buildTextFieldComponent())
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

  describe('createMapOfColumnNameMappings', () => {
    it('should handle no columns', async () => {
      jest.mocked(getColumnPropertiesFromGraph).mockResolvedValueOnce(undefined)
      const map = await createMapOfColumnProperties('site-id', 'list-id')
      expect(map).toBeDefined()
      expect(map.size).toBe(0)
    })
  })

  describe('addBaseFields', () => {
    it('should handle preview', () => {
      const definition = {
        ...definitionForSharepointTest
      }
      const message = {
        meta: {
          timestamp: 'date/time now',
          isPreview: true,
          referenceNumber: 'ref-123'
        }
      }
      const fields = new Map()
      // @ts-expect-error - partial mock of message
      addBaseFields(definition, message, fields)
      expect(fields.size).toBe(2)
      expect(fields.get('Submission type')).toBe('Preview')
    })

    it('should handle real', () => {
      const definition = {
        ...definitionForSharepointTest
      }
      const message = {
        meta: {
          timestamp: 'date/time now',
          isPreview: false,
          referenceNumber: 'ref-123'
        }
      }
      const fields = new Map()
      // @ts-expect-error - partial mock of message
      addBaseFields(definition, message, fields)
      expect(fields.size).toBe(2)
      expect(fields.get('Submission type')).toBe('Real')
    })
  })

  describe('getJsDatatype', () => {
    it('should return the correct type', () => {
      expect(getJsDatatype(123)).toBe('number')
      expect(getJsDatatype('abc')).toBe('string')
      expect(getJsDatatype(new Date())).toBe('date')
      expect(getJsDatatype({})).toBe('unknown')
      expect(getJsDatatype([])).toBe('unknown')
    })
  })

  describe('datatypeGuard', () => {
    it('should throw if mismatch of types', () => {
      const component = /** @type {any} */ (buildTextFieldComponent())
      const properties = new Map([
        ['my-field', { name: 'my-field', datatype: 'string' }]
      ])
      expect(() => {
        datatypeGuard(component, 'my-field', new Date(), properties)
      }).toThrow(
        "Invalid datatype for column 'my-field' - date in form definition but string in Sharepoint list"
      )
    })

    it('should throw if missing from Sharepoint', () => {
      const component = /** @type {any} */ (buildTextFieldComponent())
      const properties = new Map()
      expect(() => {
        datatypeGuard(component, 'my-field', new Date(), properties)
      }).toThrow(
        "Invalid datatype for column 'my-field' - date in form definition but missing column in Sharepoint list"
      )
    })
  })

  describe('getSharepointDatatype', () => {
    it('should return unknown if not number, date or string', () => {
      const column = { displayName: 'my-col', name: 'my-col' }
      expect(getSharepointDatatype(column)).toBe('unknown')
    })
  })
})

/**
 * @import { CellValue } from '~/src/service/sharepoint-types.js'
 */
