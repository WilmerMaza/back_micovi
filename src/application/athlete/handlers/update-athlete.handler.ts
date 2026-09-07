/**
 * Handler que ejecuta la actualización de un atleta.
 * Valida existencia de catálogos, ownership y unicidad de documento/email.
 */
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AthleteDto } from 'src/application/athlete/dto/athlete.dto';
import { mapAthleteToDto } from 'src/application/athlete/mappers/athlete.mapper';
import { AthleteNotFoundException } from 'src/domain/athlete/exceptions/athlete-not-found.exception';
import { AthleteRepository } from 'src/domain/athlete/repositories/athlete.repository';
import { CategoryRepository } from 'src/domain/category/repositories/category.repository';
import { CategoryNotFoundException } from 'src/domain/category/exceptions/category-not-found.exception';
import { CityRepository } from 'src/domain/city/repositories/city.repository';
import { CityNotFoundException } from 'src/domain/city/exceptions/city-not-found.exception';
import { CountryRepository } from 'src/domain/country/repositories/country.repository';
import { CountryNotFoundException } from 'src/domain/country/exceptions/country-not-found.exception';
import { DepartmentRepository } from 'src/domain/department/repositories/department.repository';
import { DepartmentNotFoundException } from 'src/domain/department/exceptions/department-not-found.exception';
import { DisciplineRepository } from 'src/domain/discipline/repositories/discipline.repository';
import { DisciplineNotFoundException } from 'src/domain/discipline/exceptions/discipline-not-found.exception';
import { DocumentTypeRepository } from 'src/domain/document-type/repositories/document-type.repository';
import { DocumentTypeNotFoundException } from 'src/domain/document-type/exceptions/document-type-not-found.exception';
import { EducationLevelRepository } from 'src/domain/education-level/repositories/education-level.repository';
import { EducationLevelNotFoundException } from 'src/domain/education-level/exceptions/education-level-not-found.exception';
import { GenderRepository } from 'src/domain/gender/repositories/gender.repository';
import { GenderNotFoundException } from 'src/domain/gender/exceptions/gender-not-found.exception';
import { SchoolRepository } from 'src/domain/school/repositories/school.repository';
import { SchoolNotFoundException } from 'src/domain/school/exceptions/school-not-found.exception';
import { UpdateAthleteCommand } from '../commands/update-athlete.command';

@CommandHandler(UpdateAthleteCommand)
export class UpdateAthleteHandler implements ICommandHandler<UpdateAthleteCommand, AthleteDto> {
  constructor(
    private readonly athleteRepository: AthleteRepository,
    private readonly documentTypeRepository: DocumentTypeRepository,
    private readonly genderRepository: GenderRepository,
    private readonly countryRepository: CountryRepository,
    private readonly departmentRepository: DepartmentRepository,
    private readonly cityRepository: CityRepository,
    private readonly educationLevelRepository: EducationLevelRepository,
    private readonly schoolRepository: SchoolRepository,
    private readonly disciplineRepository: DisciplineRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(command: UpdateAthleteCommand): Promise<AthleteDto> {
    const athlete = await this.athleteRepository.findBySchoolAndId(
      command.schoolId,
      command.athleteId,
    );
    if (!athlete) {
      throw new AthleteNotFoundException(command.athleteId);
    }

    if (command.documentTypeId) {
      const dt = await this.documentTypeRepository.findById(command.documentTypeId);
      if (!dt) throw new DocumentTypeNotFoundException(command.documentTypeId);
    }
    if (command.genderId) {
      const g = await this.genderRepository.findById(command.genderId);
      if (!g) throw new GenderNotFoundException(command.genderId);
    }
    if (command.birthCountryId) {
      const c = await this.countryRepository.findById(command.birthCountryId);
      if (!c) throw new CountryNotFoundException(command.birthCountryId);
    }
    if (command.birthDepartmentId) {
      const d = await this.departmentRepository.findById(command.birthDepartmentId);
      if (!d) throw new DepartmentNotFoundException(command.birthDepartmentId);
    }
    if (command.birthCityId) {
      const c = await this.cityRepository.findById(command.birthCityId);
      if (!c) throw new CityNotFoundException(command.birthCityId);
    }
    if (command.residenceCountryId) {
      const c = await this.countryRepository.findById(command.residenceCountryId);
      if (!c) throw new CountryNotFoundException(command.residenceCountryId);
    }
    if (command.residenceDepartmentId) {
      const d = await this.departmentRepository.findById(command.residenceDepartmentId);
      if (!d) throw new DepartmentNotFoundException(command.residenceDepartmentId);
    }
    if (command.residenceCityId) {
      const c = await this.cityRepository.findById(command.residenceCityId);
      if (!c) throw new CityNotFoundException(command.residenceCityId);
    }
    if (command.educationLevelId) {
      const el = await this.educationLevelRepository.findById(command.educationLevelId);
      if (!el) throw new EducationLevelNotFoundException(command.educationLevelId);
    }
    if (command.schoolId) {
      const s = await this.schoolRepository.findById(command.schoolId);
      if (!s) throw new SchoolNotFoundException(command.schoolId);
    }
    if (command.disciplineId) {
      const disc = await this.disciplineRepository.findById(command.disciplineId);
      if (!disc) throw new DisciplineNotFoundException(command.disciplineId);
    }
    if (command.categoryId) {
      const cat = await this.categoryRepository.findById(command.categoryId);
      if (!cat) throw new CategoryNotFoundException(command.categoryId);
    }

    const updated = await this.athleteRepository.update(command.athleteId, {
      firstName: command.firstName,
      lastName: command.lastName,
      birthDate: command.birthDate,
      documentTypeId: command.documentTypeId,
      documentNumber: command.documentNumber,
      genderId: command.genderId,
      birthCountryId: command.birthCountryId,
      birthDepartmentId: command.birthDepartmentId,
      birthCityId: command.birthCityId,
      residenceCountryId: command.residenceCountryId,
      residenceDepartmentId: command.residenceDepartmentId,
      residenceCityId: command.residenceCityId,
      educationLevelId: command.educationLevelId,
      educationInstitution: command.educationInstitution,
      categoryId: command.categoryId,
      weight: command.weight,
      height: command.height,
      email: command.email,
      phone: command.phone,
    });

    if (command.disciplineId && command.disciplineId !== athlete.disciplineId) {
      if (athlete.disciplineId) {
        await this.athleteRepository.removeDiscipline(athlete.id, athlete.disciplineId);
      }
      await this.athleteRepository.addDiscipline(athlete.id, command.disciplineId);
    }

    return mapAthleteToDto(updated);
  }
}
