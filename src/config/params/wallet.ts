import { Joi } from 'express-validation';

export default {
  getMovements: {
    query: Joi.object({
      type: Joi.string().valid('CREDIT', 'DEBIT').optional(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
    }),
  },
  addMovement: {
    body: Joi.object({
      amount: Joi.number().required().min(0),
      type: Joi.string().valid('CREDIT', 'DEBIT').required(),
      description: Joi.string().required(),
    }),
  },
}; 