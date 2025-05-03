/* eslint-disable @typescript-eslint/naming-convention */
import Joi from 'joi';

export const apiSchema = Joi.object({
  BASE_API_URL: Joi.string().required(),
})
  .unknown()
  .required();
