const Joi = require('joi');

// Pattern: only digits, space, and plus sign, max 15 characters
const relaxedPhonePattern = /^[\d+ ]{1,15}$/;

const contactSchema = Joi.object({
  id: Joi.number().integer(),
  name_title: Joi.string(),

  full_name: Joi.string().required().messages({
    'string.empty': 'Full name is required',
  }),

  phone: Joi.string()
    .pattern(relaxedPhonePattern)
    .required()
    .messages({
      'string.pattern.base': 'Mobile number must be max 15 characters, digits, space or + only.',
      'string.empty': 'Mobile number is required',
    }),

  whatsapp: Joi.string()
    .pattern(relaxedPhonePattern)
    .messages({
      'string.pattern.base': 'WhatsApp number must be max 15 characters, digits, space or + only.',
    }),

  email: Joi.string().email().required(),
  alternate_email: Joi.string().email(),

  address: Joi.string(),
  city: Joi.string(),
  state: Joi.string(),
  postal_code: Joi.string(),
  country: Joi.string(),
  contact_type: Joi.string(),
  organization_name: Joi.string(),
  job_title: Joi.string(),
  department: Joi.string(),

  website: Joi.string().uri(),
  linkedin: Joi.string().uri(),
  facebook: Joi.string().uri(),
  instagram: Joi.string().uri(),

  relationship: Joi.string(),
  notes: Joi.string(),
  is_favorite: Joi.boolean(),
  is_active: Joi.boolean(),
});

module.exports = {
  contactSchema,
};
