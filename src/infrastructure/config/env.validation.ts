import { z } from 'zod';
import { parseCorsOrigins } from './cors.config';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(14),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
  CSRF_ENABLED: z
    .string()
    .optional()
    .transform((v) => v !== 'false'),
  CORS_ORIGINS: z
    .string()
    .default('["http://localhost:4200","http://127.0.0.1:4200"]')
    .transform((value) => parseCorsOrigins(value)),
});

export function validate(config: Record<string, unknown>): Record<string, unknown> {
  const parsed = EnvSchema.safeParse(config);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Config validation error: ${msg}`);
  }
  return parsed.data;
}
