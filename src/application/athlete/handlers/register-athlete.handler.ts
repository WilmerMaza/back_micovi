import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { AthleteDto } from 'src/application/athlete/dto/athlete.dto';
import { mapAthleteToDto } from 'src/application/athlete/mappers/athlete.mapper';
import { Athlete } from 'src/domain/athlete/entities/athlete.entity';
import { AthleteAlreadyExistsException } from 'src/domain/athlete/exceptions/athlete-already-exists.exception';
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
import { EmailAlreadyInUseException } from 'src/domain/auth/exceptions/email-already-in-use.exception';
import { GenderRepository } from 'src/domain/gender/repositories/gender.repository';
import { GenderNotFoundException } from 'src/domain/gender/exceptions/gender-not-found.exception';
import { SchoolRepository } from 'src/domain/school/repositories/school.repository';
import { SchoolNotFoundException } from 'src/domain/school/exceptions/school-not-found.exception';
import { RegisterAthleteCommand } from '../commands/register-athlete.command';

@CommandHandler(RegisterAthleteCommand)
export class RegisterAthleteHandler implements ICommandHandler<RegisterAthleteCommand, AthleteDto> {
  constructor(
    private readonly documentTypeRepository: DocumentTypeRepository,
    private readonly genderRepository: GenderRepository,
    private readonly countryRepository: CountryRepository,
    private readonly departmentRepository: DepartmentRepository,
    private readonly cityRepository: CityRepository,
    private readonly educationLevelRepository: EducationLevelRepository,
    private readonly schoolRepository: SchoolRepository,
    private readonly disciplineRepository: DisciplineRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly athleteRepository: AthleteRepository,
  ) {}

  async execute(command: RegisterAthleteCommand): Promise<AthleteDto> {
    // 1. Validate document type exists
    const documentType = await this.documentTypeRepository.findById(command.documentTypeId);
    if (!documentType) {
      throw new DocumentTypeNotFoundException(command.documentTypeId);
    }

    // 2. Validate gender exists
    const gender = await this.genderRepository.findById(command.genderId);
    if (!gender) {
      throw new GenderNotFoundException(command.genderId);
    }

    // 3. Validate birth country exists
    const birthCountry = await this.countryRepository.findById(command.birthCountryId);
    if (!birthCountry) {
      throw new CountryNotFoundException(command.birthCountryId);
    }

    // 4. Validate birth department exists and belongs to birth country
    const birthDepartment = await this.departmentRepository.findById(command.birthDepartmentId);
    if (!birthDepartment) {
      throw new DepartmentNotFoundException(command.birthDepartmentId);
    }
    if (birthDepartment.countryId !== command.birthCountryId) {
      throw new Error(
        `Department "${command.birthDepartmentId}" does not belong to country "${command.birthCountryId}"`,
      );
    }

    // 5. Validate birth city exists and belongs to birth department
    const birthCity = await this.cityRepository.findById(command.birthCityId);
    if (!birthCity) {
      throw new CityNotFoundException(command.birthCityId);
    }
    if (birthCity.departmentId !== command.birthDepartmentId) {
      throw new Error(
        `City "${command.birthCityId}" does not belong to department "${command.birthDepartmentId}"`,
      );
    }

    // 6. Validate residence country exists
    const residenceCountry = await this.countryRepository.findById(command.residenceCountryId);
    if (!residenceCountry) {
      throw new CountryNotFoundException(command.residenceCountryId);
    }

    // 7. Validate residence department exists and belongs to residence country
    const residenceDepartment = await this.departmentRepository.findById(
      command.residenceDepartmentId,
    );
    if (!residenceDepartment) {
      throw new DepartmentNotFoundException(command.residenceDepartmentId);
    }
    if (residenceDepartment.countryId !== command.residenceCountryId) {
      throw new Error(
        `Department "${command.residenceDepartmentId}" does not belong to country "${command.residenceCountryId}"`,
      );
    }

    // 8. Validate residence city exists and belongs to residence department
    const residenceCity = await this.cityRepository.findById(command.residenceCityId);
    if (!residenceCity) {
      throw new CityNotFoundException(command.residenceCityId);
    }
    if (residenceCity.departmentId !== command.residenceDepartmentId) {
      throw new Error(
        `City "${command.residenceCityId}" does not belong to department "${command.residenceDepartmentId}"`,
      );
    }

    // 9. Validate education level exists
    const educationLevel = await this.educationLevelRepository.findById(command.educationLevelId);
    if (!educationLevel) {
      throw new EducationLevelNotFoundException(command.educationLevelId);
    }

    // 10. Validate school exists
    const school = await this.schoolRepository.findById(command.schoolId);
    if (!school) {
      throw new SchoolNotFoundException(command.schoolId);
    }

    // 11. Validate discipline exists and belongs to the selected school
    const discipline = await this.disciplineRepository.findById(command.disciplineId);
    if (!discipline) {
      throw new DisciplineNotFoundException(command.disciplineId);
    }
    if (discipline.schoolId !== command.schoolId) {
      throw new Error(
        `Discipline "${command.disciplineId}" does not belong to school "${command.schoolId}"`,
      );
    }

    // 12. Validate category exists and belongs to the selected school
    const category = await this.categoryRepository.findById(command.categoryId);
    if (!category) {
      throw new CategoryNotFoundException(command.categoryId);
    }
    if (category.schoolId !== command.schoolId) {
      throw new Error(
        `Category "${command.categoryId}" does not belong to school "${command.schoolId}"`,
      );
    }

    // 13. Validate unique document
    const existingByDoc = await this.athleteRepository.findByDocument(
      command.documentTypeId,
      command.documentNumber,
    );
    if (existingByDoc) {
      throw new AthleteAlreadyExistsException(command.documentTypeId, command.documentNumber);
    }

    // 14. Validate unique email
    const existingByEmail = await this.athleteRepository.findByEmail(command.email);
    if (existingByEmail) {
      throw new EmailAlreadyInUseException(command.email);
    }

    // 15. Calculate age from birthDate
    const age = this.calculateAge(command.birthDate);
    const fullName = `${command.firstName} ${command.lastName}`;

    // 16. Create Athlete entity
    const now = new Date();
    const athlete = new Athlete(
      randomUUID(),
      fullName,
      command.firstName,
      command.lastName,
      age,
      now,
      now,
      null,
      command.documentTypeId,
      command.documentNumber,
      command.birthDate,
      command.genderId,
      command.birthCountryId,
      command.birthDepartmentId,
      command.birthCityId,
      command.residenceCountryId,
      command.residenceDepartmentId,
      command.residenceCityId,
      command.educationLevelId,
      command.educationInstitution,
      command.categoryId,
      command.weight,
      command.height,
      command.schoolId,
      command.disciplineId,
      command.email,
      command.phone,
    );

    // 17. Persist
    const created = await this.athleteRepository.create(athlete);

    // 18. Build and return response
    return mapAthleteToDto(created);
  }

  private calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
}
