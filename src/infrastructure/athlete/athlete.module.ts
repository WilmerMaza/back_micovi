import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterAthleteHandler } from 'src/application/athlete/handlers/register-athlete.handler';
import { AthleteController } from 'src/interfaces/rest/athlete/controllers/athlete.controller';
import { CatalogModule } from '../catalog/catalog.module';
import { PersistenceModule } from '../persistence/persistence.module';

@Module({
  imports: [CqrsModule, PersistenceModule, CatalogModule],
  controllers: [AthleteController],
  providers: [RegisterAthleteHandler],
})
export class AthleteModule {}
