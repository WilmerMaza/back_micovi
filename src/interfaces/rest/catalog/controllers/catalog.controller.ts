/**
 * Controller para consultas de catálogos del sistema.
 * Provee endpoints para obtener listas de tipos de documento, géneros,
 * países, departamentos, ciudades, niveles educativos, disciplinas y categorías.
 */
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { ListDocumentTypesQuery } from 'src/application/catalog/queries/list-document-types.query';
import { ListGendersQuery } from 'src/application/catalog/queries/list-genders.query';
import { ListCountriesQuery } from 'src/application/catalog/queries/list-countries.query';
import { GetDepartmentsByCountryQuery } from 'src/application/catalog/queries/get-departments-by-country.query';
import { GetCitiesByDepartmentQuery } from 'src/application/catalog/queries/get-cities-by-department.query';
import { ListEducationLevelsQuery } from 'src/application/catalog/queries/list-education-levels.query';
import { GetDisciplinesBySchoolQuery } from 'src/application/catalog/queries/get-disciplines-by-school.query';
import { GetCategoriesBySchoolQuery } from 'src/application/catalog/queries/get-categories-by-school.query';

@ApiTags('Catalogs')
@Controller('catalogs')
export class CatalogController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('document-types')
  @ApiOperation({ summary: 'Listar tipos de documento' })
  listDocumentTypes() {
    return this.queryBus.execute(new ListDocumentTypesQuery());
  }

  @Get('genders')
  @ApiOperation({ summary: 'Listar géneros' })
  listGenders() {
    return this.queryBus.execute(new ListGendersQuery());
  }

  @Get('countries')
  @ApiOperation({ summary: 'Listar países' })
  listCountries() {
    return this.queryBus.execute(new ListCountriesQuery());
  }

  @Get('countries/:countryId/departments')
  @ApiOperation({ summary: 'Listar departamentos por país' })
  @ApiParam({ name: 'countryId', description: 'ID del país' })
  getDepartmentsByCountry(@Param('countryId') countryId: string) {
    return this.queryBus.execute(new GetDepartmentsByCountryQuery(countryId));
  }

  @Get('departments/:departmentId/cities')
  @ApiOperation({ summary: 'Listar ciudades por departamento' })
  @ApiParam({ name: 'departmentId', description: 'ID del departamento' })
  getCitiesByDepartment(@Param('departmentId') departmentId: string) {
    return this.queryBus.execute(new GetCitiesByDepartmentQuery(departmentId));
  }

  @Get('education-levels')
  @ApiOperation({ summary: 'Listar niveles educativos' })
  listEducationLevels() {
    return this.queryBus.execute(new ListEducationLevelsQuery());
  }

  @Get('schools/:schoolId/disciplines')
  @ApiOperation({ summary: 'Listar disciplinas deportivas por institución' })
  @ApiParam({ name: 'schoolId', description: 'ID de la institución' })
  getDisciplinesBySchool(@Param('schoolId') schoolId: string) {
    return this.queryBus.execute(new GetDisciplinesBySchoolQuery(schoolId));
  }

  @Get('schools/:schoolId/categories')
  @ApiOperation({ summary: 'Listar categorías deportivas por institución' })
  @ApiParam({ name: 'schoolId', description: 'ID de la institución' })
  getCategoriesBySchool(@Param('schoolId') schoolId: string) {
    return this.queryBus.execute(new GetCategoriesBySchoolQuery(schoolId));
  }
}
