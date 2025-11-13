import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(16),
});

export function validate(config: Record<string, unknown>): Record<string, unknown> {
  const parsed = EnvSchema.safeParse(config);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Config validation error: ${msg}`);
  }
  return parsed.data;
}
