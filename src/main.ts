import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [new transports.Console()],
      format: format.json(),
    }),
  });
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Micovi API')
    .setDescription('Documentación de la API de Micovi')
    .setVersion('1.0')
    .addBearerAuth() // Para JWT si usas autenticación
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // URL: http://localhost:3000/api
  await app.listen(process.env.PORT || 3000);
}
void bootstrap();
