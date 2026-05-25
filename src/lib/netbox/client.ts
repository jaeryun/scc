import createClient from 'openapi-fetch';
import type { paths } from './schema';
import { envSchema } from './env';

const env = envSchema.parse(process.env);

const rawClient = createClient<paths>({
  baseUrl: env.NETBOX_BASE_URL,
  headers: {
    Authorization: `Token ${env.NETBOX_API_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

export const netbox = {
  GET: rawClient.GET,
  POST: rawClient.POST,
  PUT: rawClient.PUT,
  PATCH: rawClient.PATCH,
  DELETE: rawClient.DELETE
};
