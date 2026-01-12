import { ComponentType, ControllerType, Engine } from '@defra/forms-model'
import { buildDefinition } from '@defra/forms-model/stubs'

export const definitionForSharepointTest = buildDefinition({
  name: 'Test submit',
  engine: Engine.V2,
  schema: 2,
  startPage: '/summary',
  pages: [
    {
      title: 'Personal details',
      path: '/personal-details',
      components: [
        {
          type: ComponentType.TextField,
          title: 'Text field',
          name: 'wVRKCI',
          shortDescription: 'Text field',
          hint: '',
          options: {
            required: true,
            classes: ''
          },
          schema: {},
          id: '0540fdbf-4c67-4fe4-a732-4b7acec40d65'
        },
        {
          type: ComponentType.MultilineTextField,
          title: 'Multiline textfield',
          name: 'WInVOJ',
          shortDescription: 'Multiline',
          hint: '',
          options: {
            required: true,
            classes: ''
          },
          schema: {},
          id: 'bfcceb3e-5043-4dbd-8f71-9ea3b693eb14'
        },
        {
          type: ComponentType.NumberField,
          title: 'Number field',
          name: 'ZikKKi',
          shortDescription: 'Number',
          hint: '',
          options: {
            required: true,
            classes: '',
            prefix: '',
            suffix: ''
          },
          schema: {},
          id: 'e083f50b-50f1-49ae-ada2-fc3de84c3849'
        },
        {
          type: ComponentType.DatePartsField,
          title: 'Date parts field',
          name: 'lNTqki',
          shortDescription: 'Date parts field',
          hint: '',
          options: {
            required: true,
            classes: ''
          },
          id: '0b149f24-3765-46ff-8ad8-1d5ae59a468e'
        },
        {
          type: ComponentType.MonthYearField,
          title: 'Month and year',
          name: 'GesUIU',
          shortDescription: 'Month and year',
          hint: '',
          options: {
            required: true
          },
          id: 'fadac1a4-5daf-42f3-8069-4baf0304d08c'
        },
        {
          type: ComponentType.UkAddressField,
          title: 'UK address field',
          name: 'EcAuAJ',
          shortDescription: 'UK address field',
          hint: '',
          options: {
            required: true
          },
          id: '78cae911-b965-49a3-94d2-25da3abdcd99'
        },
        {
          type: ComponentType.TelephoneNumberField,
          title: 'Phone number',
          name: 'QpxLOe',
          shortDescription: 'Phone number',
          hint: '',
          options: {
            required: true,
            classes: ''
          },
          id: 'e3184c42-6c12-4c24-a166-c178e937a386'
        },
        {
          type: ComponentType.EmailAddressField,
          title: 'Email address',
          name: 'qSQlXQ',
          shortDescription: 'Email address',
          hint: '',
          options: {
            required: true,
            classes: ''
          },
          id: '57c9bc1f-50ae-41c3-b5be-28272949fcb9'
        },
        {
          type: ComponentType.YesNoField,
          title: 'Yes or no',
          name: 'Hkrpqu',
          shortDescription: 'Yes or no',
          hint: '',
          options: {
            required: true
          },
          id: 'eb3989f2-49d8-48b2-ac27-c1a4890dee49'
        },
        {
          type: ComponentType.CheckboxesField,
          title: 'Checkboxes field',
          name: 'itTQpn',
          shortDescription: 'Checkboxes field',
          hint: '',
          options: {
            required: true
          },
          list: '47938083-ab02-416b-b195-452aebd401b6',
          id: '21230beb-da9f-4553-8304-b03ab9dbe5e7'
        },
        {
          type: ComponentType.RadiosField,
          title: 'Radios field',
          name: 'KDVPWv',
          shortDescription: 'Radios field',
          hint: '',
          options: {
            required: true
          },
          list: '76f57648-25a1-4d9c-8259-40e4caab5bcf',
          id: '8ed0e3ec-f4d1-44be-a4da-290069014d9f'
        },
        {
          type: ComponentType.AutocompleteField,
          title: 'Autocomplete field',
          name: 'JLyrSq',
          shortDescription: 'Autocomplete field',
          hint: '',
          options: {
            required: true
          },
          list: '09b86edf-ded0-4e48-b4c7-3fe9f79fcd3e',
          id: 'fb66527a-33c0-40d9-8dfd-e9a49920585e'
        },
        {
          type: ComponentType.SelectField,
          title: 'Select field',
          name: 'ZjjIss',
          shortDescription: 'Select field',
          hint: '',
          options: {
            required: true
          },
          list: 'e920f7a3-9ec6-4d1d-9fe8-bd386e78f80c',
          id: 'bd283d1f-1e3d-437f-acab-42946bd369c0'
        },
        {
          type: ComponentType.DeclarationField,
          title: 'Declaration question',
          name: 'LNOPHF',
          shortDescription: 'Declaration question',
          content: 'Agree this',
          options: {
            required: true
          },
          id: 'd887df82-871c-4ad2-a399-e6ff6efda208'
        }
      ],
      next: [],
      id: 'ea9cc47a-c8cc-42d4-b0d0-8dc0e16bda3e'
    },
    {
      controller: ControllerType.FileUpload,
      title: '',
      path: '/attach-a-file',
      components: [
        {
          type: ComponentType.FileUploadField,
          title: 'Attach a file',
          name: 'XpXizx',
          shortDescription: 'Your file',
          hint: '',
          options: {
            required: true
          },
          schema: {},
          id: '12ab36b8-0678-4b4d-8e1a-2654245d8dc3'
        }
      ],
      next: [],
      id: '2abd3ae1-5afd-487b-b18a-2360f77b2625'
    },
    {
      title: 'Fruits',
      path: '/fruits',
      components: [
        {
          type: ComponentType.TextField,
          title: 'What is your favourite fruit?',
          name: 'jRCnMi',
          shortDescription: 'Favourite fruit',
          hint: '',
          options: {
            required: true,
            classes: ''
          },
          schema: {},
          id: '6cccc78f-238b-488f-b61c-9e2c437f75bf'
        },
        {
          type: ComponentType.DatePartsField,
          title: 'What is your date of birth?',
          name: 'mtJFqE',
          shortDescription: 'Date of birth',
          hint: '',
          options: {
            required: true,
            classes: ''
          },
          id: 'a995f6ec-cdaa-4a33-bdb0-a5dc031daa14'
        }
      ],
      next: [],
      id: '70aa976f-55d9-45f9-94b7-ea5cac9e0e53',
      controller: ControllerType.Repeat,
      repeat: {
        options: {
          name: 'LAWQBm',
          title: 'Fruits vs age'
        },
        schema: {
          min: 1,
          max: 5
        }
      }
    },
    {
      id: '449a45f6-4541-4a46-91bd-8b8931b07b50',
      title: '',
      path: '/summary',
      controller: ControllerType.SummaryWithConfirmationEmail
    }
  ],
  lists: [
    {
      name: 'lIoSeM',
      title: 'List for question itTQpn',
      type: 'string',
      items: [
        {
          id: 'f66f9686-b97a-41b5-b45f-e0f82f97a73a',
          text: 'Item 1',
          value: 'Item 1'
        },
        {
          id: '9051bfc1-e6e2-4380-95a7-16182e786caf',
          text: 'Item 2',
          value: 'Item 2'
        }
      ],
      id: '47938083-ab02-416b-b195-452aebd401b6'
    },
    {
      name: 'FyaDrr',
      title: 'List for question KDVPWv',
      type: 'string',
      items: [
        {
          id: 'e10d016d-468c-4181-86d4-5956a3fb6bf1',
          text: 'Radio 1',
          value: 'Radio 1'
        },
        {
          id: 'fb2646ad-0a15-40ea-8f4f-1a9eb2f142a4',
          text: 'Radio 2',
          value: 'Radio 2'
        }
      ],
      id: '76f57648-25a1-4d9c-8259-40e4caab5bcf'
    },
    {
      name: 'URYwwR',
      title: 'List for question JLyrSq',
      type: 'string',
      items: [
        {
          text: 'Autocomplete 1',
          value: 'Autocomplete 1',
          id: 'ddc56002-a859-4959-8d27-4a6b991666ce'
        },
        {
          text: 'Autocomplete 2',
          value: 'Autocomplete 2',
          id: 'a8c92d45-15c4-4931-b31f-2cc7ddf79954'
        }
      ],
      id: '09b86edf-ded0-4e48-b4c7-3fe9f79fcd3e'
    },
    {
      name: 'xtsmwI',
      title: 'List for question ZjjIss',
      type: 'string',
      items: [
        {
          id: '73d62616-c2f3-43b3-8fa1-c6b011ae415c',
          text: 'Select option 1',
          value: 'Select option 1'
        },
        {
          id: 'd8d2e6ad-574f-4350-b336-2d9740803ad8',
          text: 'Select option 2',
          value: 'Select option 2'
        }
      ],
      id: 'e920f7a3-9ec6-4d1d-9fe8-bd386e78f80c'
    }
  ]
})
