import Joi from 'joi'

export const formMappingsSchema = Joi.object({
  mappings: Joi.array()
    .items({
      formId: Joi.string().required(),
      siteId: Joi.string().required(),
      listId: Joi.string().required(),
      status: Joi.string().valid('live', 'draft').required()
    })
    .min(0)
})
