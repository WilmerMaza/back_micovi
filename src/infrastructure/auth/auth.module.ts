import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { PasswordHasher } from 'src/domain/auth/services/password-hasher.service';
import { PersistenceModule } from '../persistence/persistence.module';
import { AuthController } from 'src/interfaces/rest/auth/controllers/auth.controller';
import { LoginHandler } from 'src/application/auth/commands/handlers/login.handler';
import { LocalAuthGuard } from './http/guard/local-auth.guard';
import { LocalStrategy } from './http/strategies/local.strategy';
import { ScryptPasswordHasherService } from './services/scrypt-password-hasher.service';

@Module({
  imports: [CqrsModule, PassportModule, PersistenceModule],
  controllers: [AuthController],
  providers: [
    LoginHandler,
    LocalStrategy,
    LocalAuthGuard,
    ScryptPasswordHasherService,
    {
      provide: PasswordHasher,
      useExisting: ScryptPasswordHasherService,
    },
  ],
  exports: [PasswordHasher],
})
export class AuthModule {}
