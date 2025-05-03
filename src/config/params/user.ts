import { Joi } from 'express-validation';

export default {
  getBooks: {
    params: Joi.object({
      email: Joi.string().email().required(),
    }),
    query: Joi.object({
      type: Joi.string().valid('BORROWED', 'BOUGHT').optional(),
      status: Joi.string().valid('ACTIVE', 'RETURNED').optional(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
    }),
  },
}; 