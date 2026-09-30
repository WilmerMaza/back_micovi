import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterCoachHandler } from 'src/application/coach/commands/handlers/register-coach.handler';
import { CoachController } from 'src/interfaces/rest/coach/controllers/coach.controller';
import { PersistenceModule } from '../persistence/persistence.module';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [CqrsModule, PersistenceModule, SecurityModule],
  controllers: [CoachController],
  providers: [RegisterCoachHandler],
})
export class CoachModule {}
