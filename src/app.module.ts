import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // <-- IMPORTANTE
import { AuthModule } from './infrastructure/auth/auth.module';
import { validate } from './infrastructure/config/env.validation';
import { SchoolModule } from './infrastructure/school/school.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
      validate,
    }),
    AuthModule,
    SchoolModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
