import { Joi } from 'express-validation';

export default {
  getMovements: {
    query: Joi.object({
      type: Joi.string().valid('credit', 'debit').optional(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
    }),
  },
}; 