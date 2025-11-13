import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PasswordHasher } from 'src/domain/auth/services/password-hasher.service';
import { RegisterSchoolHandler } from 'src/application/school/commands/handlers/register-school.handler';
import { SchoolController } from 'src/interfaces/rest/school/controllers/school.controller';
import { PersistenceModule } from '../persistence/persistence.module';
import { ScryptPasswordHasherService } from '../auth/services/scrypt-password-hasher.service';

@Module({
  imports: [CqrsModule, PersistenceModule],
  controllers: [SchoolController],
  providers: [
    RegisterSchoolHandler,
    ScryptPasswordHasherService,
    {
      provide: PasswordHasher,
      useExisting: ScryptPasswordHasherService,
    },
  ],
})
export class SchoolModule {}
