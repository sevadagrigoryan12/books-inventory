/* eslint-disable @typescript-eslint/naming-convention */
import Joi from 'joi';
import { defaultSchema } from './default';

export const serviceSchema = defaultSchema.append({
  NODE_ENV: Joi.string().valid('test', 'development', 'production').default('development'),
  NODE_TLS_REJECT_UNAUTHORIZED: Joi.number().valid(0, 1).default(1),
  PORT: Joi.number().default(3000),
});
