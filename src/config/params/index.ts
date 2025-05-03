import Joi from '@hapi/joi';

export default {
  serviceEndpoint: {
    body: Joi.object({
      example: Joi.string().optional(),
    }),
  },
};
