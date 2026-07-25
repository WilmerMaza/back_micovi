import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PersistenceModule } from '../persistence/persistence.module';
import { AuthController } from 'src/interfaces/rest/auth/controllers/auth.controller';
import { LoginHandler } from 'src/application/auth/commands/handlers/login.handler';
import { GetMeHandler } from 'src/application/auth/queries/handlers/get-me.handler';
import { LocalAuthGuard } from './http/guard/local-auth.guard';
import { LocalStrategy } from './http/strategies/local.strategy';
import { SecurityModule } from '../security/security.module';
import { JwtStrategy } from './http/strategies/jwt.strategy';
import { JwtAuthGuard } from './http/guard/jwt-auth.guard';
import { CsrfGuard } from './http/guard/csrf.guard';
import { RolesGuard } from './http/guard/roles.guard';
import { SchoolOwnershipGuard } from './http/guard/school-ownership.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoginBodyMiddleware } from './http/middleware/login-body.middleware';
import { CookieAuthService } from './services/cookie-auth.service';
import { SessionAuthService } from './services/session-auth.service';

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    PersistenceModule,
    SecurityModule,
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get<number>('ACCESS_TOKEN_TTL_MINUTES', 15)}m`,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginHandler,
    GetMeHandler,
    LoginBodyMiddleware,
    CookieAuthService,
    SessionAuthService,
    LocalStrategy,
    LocalAuthGuard,
    JwtStrategy,
    JwtAuthGuard,
    CsrfGuard,
    RolesGuard,
    SchoolOwnershipGuard,
  ],
  exports: [JwtAuthGuard, RolesGuard, SchoolOwnershipGuard, CsrfGuard],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(LoginBodyMiddleware)
      .forRoutes({ path: 'auth/login', method: RequestMethod.POST });
  }
}
