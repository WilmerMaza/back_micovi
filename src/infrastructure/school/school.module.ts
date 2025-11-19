import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterSchoolHandler } from 'src/application/school/commands/handlers/register-school.handler';
import { SchoolController } from 'src/interfaces/rest/school/controllers/school.controller';
import { PersistenceModule } from '../persistence/persistence.module';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [CqrsModule, PersistenceModule, SecurityModule],
  controllers: [SchoolController],
  providers: [RegisterSchoolHandler],
})
export class SchoolModule {}
