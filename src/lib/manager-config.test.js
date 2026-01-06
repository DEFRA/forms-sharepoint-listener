import { FormStatus } from '@defra/forms-model'
import { buildDefinition, buildMetaData } from '@defra/forms-model/stubs'

import { getJson } from '~/src/lib/fetch.js'
import { getFormDefinition, getFormMetadata } from '~/src/lib/manager.js'

jest.mock('~/src/lib/fetch.js')
jest.mock('~/src/config/index.js', () => ({
  config: {
    get: jest.fn().mockReturnValueOnce('')
  }
}))
describe('config not set', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.mock('~/src/config/index.js', () => ({
      config: {
        get: jest.fn().mockReturnValueOnce('')
      }
    }))
  })

  it('getFormDefinition should throw if no manager url set', async () => {
    const expectedDefinition = buildDefinition()
    const formId = '68a890909ab460290c289409'
    jest
      .mocked(getJson)
      .mockResolvedValueOnce({ response: {}, body: expectedDefinition })
    await expect(() =>
      getFormDefinition(formId, FormStatus.Draft, undefined)
    ).rejects.toThrow('Missing MANAGER_URL')
  })

  it('getFormMetadata should throw if no manager url set', async () => {
    const expectedMetadata = buildMetaData()
    const formId = '68a890909ab460290c289409'
    jest
      .mocked(getJson)
      .mockResolvedValueOnce({ response: {}, body: expectedMetadata })
    await expect(() => getFormMetadata(formId)).rejects.toThrow(
      'Missing MANAGER_URL'
    )
  })
})
