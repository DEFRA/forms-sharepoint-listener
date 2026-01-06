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
          title: 'What is your name?',
          name: 'wVRKCI',
          shortDescription: 'Your name',
          hint: '',
          options: {
            required: true,
            classes: ''
          },
          schema: {},
          id: '0540fdbf-4c67-4fe4-a732-4b7acec40d65'
        },
        {
          type: ComponentType.DatePartsField,
          title: 'What date are you travelling?',
          name: 'lNTqki',
          shortDescription: 'Travel date',
          hint: '',
          options: {
            required: true,
            classes: ''
          },
          id: '0b149f24-3765-46ff-8ad8-1d5ae59a468e'
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
  ]
})
