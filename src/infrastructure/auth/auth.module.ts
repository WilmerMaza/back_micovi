import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PersistenceModule } from '../persistence/persistence.module';
import { AuthController } from 'src/interfaces/rest/auth/controllers/auth.controller';
import { LoginHandler } from 'src/application/auth/commands/handlers/login.handler';
import { LocalAuthGuard } from './http/guard/local-auth.guard';
import { LocalStrategy } from './http/strategies/local.strategy';
import { SecurityModule } from '../security/security.module';
import { JwtStrategy } from './http/strategies/jwt.strategy';
import { JwtAuthGuard } from './http/guard/jwt-auth.guard';
import { RolesGuard } from './http/guard/roles.guard';
import { SchoolOwnershipGuard } from './http/guard/school-ownership.guard';
import { AuthService } from './services/auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
        signOptions: { expiresIn: '12h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LoginHandler,
    LocalStrategy,
    LocalAuthGuard,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    SchoolOwnershipGuard,
  ],
  exports: [JwtAuthGuard, RolesGuard, SchoolOwnershipGuard],
})
export class AuthModule {}
