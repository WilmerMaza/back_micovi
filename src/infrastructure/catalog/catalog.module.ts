import { Module } from '@nestjs/common';
import { CategoryRepository } from 'src/domain/category/repositories/category.repository';
import { CityRepository } from 'src/domain/city/repositories/city.repository';
import { CountryRepository } from 'src/domain/country/repositories/country.repository';
import { DepartmentRepository } from 'src/domain/department/repositories/department.repository';
import { DisciplineRepository } from 'src/domain/discipline/repositories/discipline.repository';
import { DocumentTypeRepository } from 'src/domain/document-type/repositories/document-type.repository';
import { EducationLevelRepository } from 'src/domain/education-level/repositories/education-level.repository';
import { GenderRepository } from 'src/domain/gender/repositories/gender.repository';
import {
  StubCategoryRepository,
  StubCityRepository,
  StubCountryRepository,
  StubDepartmentRepository,
  StubDisciplineRepository,
  StubDocumentTypeRepository,
  StubEducationLevelRepository,
  StubGenderRepository,
} from './catalog.stubs';

@Module({
  providers: [
    { provide: DocumentTypeRepository, useClass: StubDocumentTypeRepository },
    { provide: CountryRepository, useClass: StubCountryRepository },
    { provide: DepartmentRepository, useClass: StubDepartmentRepository },
    { provide: CityRepository, useClass: StubCityRepository },
    { provide: GenderRepository, useClass: StubGenderRepository },
    { provide: EducationLevelRepository, useClass: StubEducationLevelRepository },
    { provide: DisciplineRepository, useClass: StubDisciplineRepository },
    { provide: CategoryRepository, useClass: StubCategoryRepository },
  ],
  exports: [
    DocumentTypeRepository,
    CountryRepository,
    DepartmentRepository,
    CityRepository,
    GenderRepository,
    EducationLevelRepository,
    DisciplineRepository,
    CategoryRepository,
  ],
})
export class CatalogModule {}
