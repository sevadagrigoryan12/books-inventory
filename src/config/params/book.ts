import { Joi } from 'express-validation';

export default {
  search: {
    query: Joi.object({
      title: Joi.string().optional(),
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
      actionType: Joi.string().valid('BORROW', 'RETURN', 'BUY', 'RESTOCK').optional(),
      userId: Joi.string().required(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
    }),
  },
  borrow: {
    params: Joi.object({
      id: Joi.number().integer().required(),
    }),
    headers: Joi.object({
      'user-id': Joi.string().required(),
    }).unknown(),
  },
  return: {
    params: Joi.object({
      id: Joi.number().integer().required(),
    }),
    headers: Joi.object({
      'user-id': Joi.string().required(),
    }).unknown(),
  },
  buy: {
    params: Joi.object({
      id: Joi.number().integer().required(),
    }),
    headers: Joi.object({
      'user-id': Joi.string().required(),
    }).unknown(),
    body: Joi.object({
      quantity: Joi.number().integer().min(1).max(2).default(1),
    }),
  },
}; 