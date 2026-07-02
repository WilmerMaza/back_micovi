import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import { AppModule } from './app.module';
import { COOKIE_NAMES } from './infrastructure/config/cookie.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [new transports.Console()],
      format: format.combine(format.timestamp(), format.json()),
    }),
  });

  const configService = app.get(ConfigService);
  const corsOrigins = configService.get<string[]>('CORS_ORIGINS', ['http://localhost:4200']);

  app.use(helmet());
  app.use(cookieParser());
  app.setGlobalPrefix('api', {
    exclude: ['document', 'document-json'],
  });

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Origin', 'X-Requested-With', 'X-CSRF-Token'],
    exposedHeaders: ['Set-Cookie'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Micovi API')
    .setDescription('API Micovi — autenticación con cookies HttpOnly')
    .setVersion('2.0')
    .addCookieAuth(COOKIE_NAMES.accessToken)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('document', app, document);

  await app.listen(configService.get<number>('PORT', 3000));
}
void bootstrap();
