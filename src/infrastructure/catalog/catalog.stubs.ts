import { Injectable } from '@nestjs/common';
import { Category } from 'src/domain/category/entities/category.entity';
import { CategoryRepository } from 'src/domain/category/repositories/category.repository';
import { City } from 'src/domain/city/entities/city.entity';
import { CityRepository } from 'src/domain/city/repositories/city.repository';
import { Country } from 'src/domain/country/entities/country.entity';
import { CountryRepository } from 'src/domain/country/repositories/country.repository';
import { Department } from 'src/domain/department/entities/department.entity';
import { DepartmentRepository } from 'src/domain/department/repositories/department.repository';
import { Discipline } from 'src/domain/discipline/entities/discipline.entity';
import { DisciplineRepository } from 'src/domain/discipline/repositories/discipline.repository';
import { DocumentType } from 'src/domain/document-type/entities/document-type.entity';
import { DocumentTypeRepository } from 'src/domain/document-type/repositories/document-type.repository';
import { EducationLevel } from 'src/domain/education-level/entities/education-level.entity';
import { EducationLevelRepository } from 'src/domain/education-level/repositories/education-level.repository';
import { Gender } from 'src/domain/gender/entities/gender.entity';
import { GenderRepository } from 'src/domain/gender/repositories/gender.repository';

// TODO: [DB] Replace these stubs with real Prisma implementations when schema is updated

@Injectable()
export class StubDocumentTypeRepository implements DocumentTypeRepository {
  findById(id: string): Promise<DocumentType | null> {
    void id;
    return Promise.resolve(null);
  }
}

@Injectable()
export class StubCountryRepository implements CountryRepository {
  findById(id: string): Promise<Country | null> {
    void id;
    return Promise.resolve(null);
  }
}

@Injectable()
export class StubDepartmentRepository implements DepartmentRepository {
  findById(id: string): Promise<Department | null> {
    void id;
    return Promise.resolve(null);
  }
}

@Injectable()
export class StubCityRepository implements CityRepository {
  findById(id: string): Promise<City | null> {
    void id;
    return Promise.resolve(null);
  }
}

@Injectable()
export class StubGenderRepository implements GenderRepository {
  findById(id: string): Promise<Gender | null> {
    void id;
    return Promise.resolve(null);
  }
}

@Injectable()
export class StubEducationLevelRepository implements EducationLevelRepository {
  findById(id: string): Promise<EducationLevel | null> {
    void id;
    return Promise.resolve(null);
  }
}

@Injectable()
export class StubDisciplineRepository implements DisciplineRepository {
  findById(id: string): Promise<Discipline | null> {
    void id;
    return Promise.resolve(null);
  }
}

@Injectable()
export class StubCategoryRepository implements CategoryRepository {
  findById(id: string): Promise<Category | null> {
    void id;
    return Promise.resolve(null);
  }
}
