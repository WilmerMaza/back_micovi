import { Module } from '@nestjs/common';
import { PasswordHasher } from 'src/domain/auth/services/password-hasher.service';
import { ScryptPasswordHasherService } from './scrypt-password-hasher.service';

@Module({
  providers: [
    ScryptPasswordHasherService,
    {
      provide: PasswordHasher,
      useExisting: ScryptPasswordHasherService,
    },
  ],
  exports: [PasswordHasher],
})
export class SecurityModule {}
