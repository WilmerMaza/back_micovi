/**
 * Módulo de catálogos del sistema.
 * Registra los handlers de queries para consultas de catálogos
 * y el controller REST que expone los endpoints.
 */
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CatalogModule as DomainCatalogModule } from 'src/infrastructure/catalog/catalog.module';
import { CatalogController } from 'src/interfaces/rest/catalog/controllers/catalog.controller';
import { ListDocumentTypesHandler } from 'src/application/catalog/queries/handlers/list-document-types.handler';
import { ListGendersHandler } from 'src/application/catalog/queries/handlers/list-genders.handler';
import { ListCountriesHandler } from 'src/application/catalog/queries/handlers/list-countries.handler';
import { GetDepartmentsByCountryHandler } from 'src/application/catalog/queries/handlers/get-departments-by-country.handler';
import { GetCitiesByDepartmentHandler } from 'src/application/catalog/queries/handlers/get-cities-by-department.handler';
import { ListEducationLevelsHandler } from 'src/application/catalog/queries/handlers/list-education-levels.handler';
import { GetDisciplinesBySchoolHandler } from 'src/application/catalog/queries/handlers/get-disciplines-by-school.handler';
import { GetCategoriesBySchoolHandler } from 'src/application/catalog/queries/handlers/get-categories-by-school.handler';

@Module({
  imports: [CqrsModule, DomainCatalogModule],
  controllers: [CatalogController],
  providers: [
    ListDocumentTypesHandler,
    ListGendersHandler,
    ListCountriesHandler,
    GetDepartmentsByCountryHandler,
    GetCitiesByDepartmentHandler,
    ListEducationLevelsHandler,
    GetDisciplinesBySchoolHandler,
    GetCategoriesBySchoolHandler,
  ],
})
export class CatalogQueryModule {}
