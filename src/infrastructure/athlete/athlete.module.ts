/**
 * Módulo de atletas/deportistas.
 * Registra handlers de CQRS, controller REST y dependencias del dominio.
 */
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterAthleteHandler } from 'src/application/athlete/handlers/register-athlete.handler';
import { UpdateAthleteHandler } from 'src/application/athlete/handlers/update-athlete.handler';
import { DeleteAthleteHandler } from 'src/application/athlete/handlers/delete-athlete.handler';
import { ListAthletesHandler } from 'src/application/athlete/queries/handlers/list-athletes.handler';
import { GetAthleteHandler } from 'src/application/athlete/queries/handlers/get-athlete.handler';
import { AthleteController } from 'src/interfaces/rest/athlete/controllers/athlete.controller';
import { CatalogModule } from '../catalog/catalog.module';
import { PersistenceModule } from '../persistence/persistence.module';

@Module({
  imports: [CqrsModule, PersistenceModule, CatalogModule],
  controllers: [AthleteController],
  providers: [
    RegisterAthleteHandler,
    UpdateAthleteHandler,
    DeleteAthleteHandler,
    ListAthletesHandler,
    GetAthleteHandler,
  ],
})
export class AthleteModule {}
