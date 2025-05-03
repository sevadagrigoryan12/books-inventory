import config from 'config/environment/variables';
import { apiSchema } from 'config/environment/schemas';

const { error, value: env } = apiSchema.validate(config);

if (error) {
  throw new Error(`Service API config validation error: ${error.message}`);
}

export default {
  baseUrl: env.BASE_API_URL,
};
