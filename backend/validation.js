const Joi = require('joi');

// Pattern: only digits, space, and plus sign, max 15 characters
const relaxedPhonePattern = /^[\d+ ]{1,15}$/;

const contactSchema = Joi.object({
  id: Joi.number().integer(),
  name_title: Joi.string(),

  full_name: Joi.string().allow('').messages({
    'string.empty': 'Full name is required',
  }),

  phone: Joi.string()
    .pattern(relaxedPhonePattern)
    .allow('')
    
    .messages({
      'string.pattern.base': 'Mobile number must be max 15 characters, digits, space or + only.',
      'string.empty': 'Mobile number is required',
    }),

  whatsapp: Joi.string()
    .pattern(relaxedPhonePattern)
    .allow('')
    
    .messages({
      'string.pattern.base': 'WhatsApp number must be max 15 characters, digits, space or + only.',
    }),

  email: Joi.string().email(),
  alternate_email: Joi.string().email().allow(''),

  address: Joi.string().allow(''),
  city: Joi.string().allow(''),
  state: Joi.string().allow(''),
  postal_code: Joi.string().allow(''),
  country: Joi.string().allow(''),
  contact_type: Joi.string().allow(''),
  organization_name: Joi.string().allow(''),
  job_title: Joi.string().allow(''),
  department: Joi.string().allow(''),

  website: Joi.string().uri().allow(''),
  linkedin: Joi.string().uri().allow(''),
  facebook: Joi.string().uri().allow(''),
  instagram: Joi.string().uri().allow(''),

  relationship: Joi.string().allow(''),
  notes: Joi.string().allow(''),
  is_favorite: Joi.any(),
  is_active: Joi.any(),
});

module.exports = {
  contactSchema,
};
