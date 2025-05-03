import { Joi } from 'express-validation';

export default {
  search: {
    query: Joi.object({
      query: Joi.string().optional(),
      author: Joi.string().optional(),
      genre: Joi.string().optional(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
    }),
  },
  getDetails: {
    params: Joi.object({
      id: Joi.number().integer().required(),
    }),
  },
  getActions: {
    params: Joi.object({
      id: Joi.number().integer().required(),
    }),
    query: Joi.object({
      actionType: Joi.string().valid('borrow', 'return', 'buy', 'restock').optional(),
      userId: Joi.string().email().optional(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
    }),
  },
  borrow: {
    params: Joi.object({
      id: Joi.number().integer().required(),
    }),
    headers: Joi.object({
      'user-email': Joi.string().email().required(),
    }).unknown(),
  },
  return: {
    params: Joi.object({
      id: Joi.number().integer().required(),
    }),
    headers: Joi.object({
      'user-email': Joi.string().email().required(),
    }).unknown(),
  },
  buy: {
    params: Joi.object({
      id: Joi.number().integer().required(),
    }),
    headers: Joi.object({
      'user-email': Joi.string().email().required(),
    }).unknown(),
  },
}; 