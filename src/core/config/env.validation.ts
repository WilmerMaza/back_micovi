import * as Joi from 'joi';
import { EnvVariables } from './env.schema';

export function validateEnv(config: Record<string, unknown>): EnvVariables {
  const envSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(3000),
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
  });

  const result = envSchema.validate(config, {
    allowUnknown: true,
    abortEarly: false,
  });

  if (result.error) {
    throw new Error(`❌ Error en variables de entorno:\n${result.error.message}`);
  }

  return result.value as EnvVariables;
}
