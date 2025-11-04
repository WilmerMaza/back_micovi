// core/config/configuration.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvVariables } from './env.schema';

@Injectable()
export class ConfigurationService {
  constructor(private readonly configService: ConfigService<EnvVariables>) {}

  get nodeEnv(): EnvVariables['NODE_ENV'] {
    return this.configService.getOrThrow('NODE_ENV');
  }

  get port(): number {
    return this.configService.getOrThrow('PORT');
  }

  get databaseUrl(): string {
    return this.configService.getOrThrow('DATABASE_URL');
  }

  get jwtSecret(): string {
    return this.configService.getOrThrow('JWT_SECRET');
  }
}
