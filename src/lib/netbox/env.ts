import { z } from 'zod';

export const envSchema = z.object({
  NETBOX_BASE_URL: z.string().url(),
  NETBOX_API_TOKEN: z.string().min(40),
  NETBOX_CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(300)
});
