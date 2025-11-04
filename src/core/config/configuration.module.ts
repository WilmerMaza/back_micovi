import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigurationService } from './config.service';
import { validateEnv } from './env.validation';
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Disponible en toda la app
      envFilePath: '.env', // Puedes modificar si está en otra ruta
      validate: validateEnv,
    }),
  ],
  providers: [ConfigurationService],
  exports: [ConfigurationService],
})
export class ConfigurationModule {}
