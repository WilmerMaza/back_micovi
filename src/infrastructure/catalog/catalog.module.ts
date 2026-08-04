import { Module } from '@nestjs/common';
import { CategoryRepository } from 'src/domain/category/repositories/category.repository';
import { CityRepository } from 'src/domain/city/repositories/city.repository';
import { CountryRepository } from 'src/domain/country/repositories/country.repository';
import { DepartmentRepository } from 'src/domain/department/repositories/department.repository';
import { DisciplineRepository } from 'src/domain/discipline/repositories/discipline.repository';
import { DocumentTypeRepository } from 'src/domain/document-type/repositories/document-type.repository';
import { EducationLevelRepository } from 'src/domain/education-level/repositories/education-level.repository';
import { GenderRepository } from 'src/domain/gender/repositories/gender.repository';
import { PrismaCategoryRepository } from './persistence/repositories/category.repository.impl';
import { PrismaCityRepository } from './persistence/repositories/city.repository.impl';
import { PrismaCountryRepository } from './persistence/repositories/country.repository.impl';
import { PrismaDepartmentRepository } from './persistence/repositories/department.repository.impl';
import { PrismaDisciplineRepository } from './persistence/repositories/discipline.repository.impl';
import { PrismaDocumentTypeRepository } from './persistence/repositories/document-type.repository.impl';
import { PrismaEducationLevelRepository } from './persistence/repositories/education-level.repository.impl';
import { PrismaGenderRepository } from './persistence/repositories/gender.repository.impl';
import { PersistenceModule } from '../persistence/persistence.module';

@Module({
  imports: [PersistenceModule],
  providers: [
    { provide: DocumentTypeRepository, useClass: PrismaDocumentTypeRepository },
    { provide: CountryRepository, useClass: PrismaCountryRepository },
    { provide: DepartmentRepository, useClass: PrismaDepartmentRepository },
    { provide: CityRepository, useClass: PrismaCityRepository },
    { provide: GenderRepository, useClass: PrismaGenderRepository },
    { provide: EducationLevelRepository, useClass: PrismaEducationLevelRepository },
    { provide: DisciplineRepository, useClass: PrismaDisciplineRepository },
    { provide: CategoryRepository, useClass: PrismaCategoryRepository },
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
