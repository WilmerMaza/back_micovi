import { Body, ConflictException, Controller, NotFoundException, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AthleteDto } from 'src/application/athlete/dto/athlete.dto';
import { RegisterAthleteCommand } from 'src/application/athlete/commands/register-athlete.command';
import { AthleteAlreadyExistsException } from 'src/domain/athlete/exceptions/athlete-already-exists.exception';
import { EmailAlreadyInUseException } from 'src/domain/auth/exceptions/email-already-in-use.exception';
import { CategoryNotFoundException } from 'src/domain/category/exceptions/category-not-found.exception';
import { CityNotFoundException } from 'src/domain/city/exceptions/city-not-found.exception';
import { CountryNotFoundException } from 'src/domain/country/exceptions/country-not-found.exception';
import { DepartmentNotFoundException } from 'src/domain/department/exceptions/department-not-found.exception';
import { DisciplineNotFoundException } from 'src/domain/discipline/exceptions/discipline-not-found.exception';
import { DocumentTypeNotFoundException } from 'src/domain/document-type/exceptions/document-type-not-found.exception';
import { EducationLevelNotFoundException } from 'src/domain/education-level/exceptions/education-level-not-found.exception';
import { GenderNotFoundException } from 'src/domain/gender/exceptions/gender-not-found.exception';
import { SchoolNotFoundException } from 'src/domain/school/exceptions/school-not-found.exception';
import { RegisterAthleteDto } from '../dtos/register-athlete.dto';

@ApiTags('Athletes')
@Controller('athletes')
export class AthleteController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @ApiOperation({ summary: 'Register a new athlete' })
  @ApiBody({ type: RegisterAthleteDto })
  @ApiCreatedResponse({ type: AthleteDto, description: 'Athlete registered successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({
    description:
      'Referenced entity (document type, gender, country, department, city, education level, school, discipline, category) not found',
  })
  @ApiConflictResponse({ description: 'Duplicate document number or email' })
  async register(@Body() dto: RegisterAthleteDto): Promise<AthleteDto> {
    try {
      return await this.commandBus.execute(
        new RegisterAthleteCommand(
          dto.documentTypeId,
          dto.documentNumber,
          dto.firstName,
          dto.lastName,
          dto.birthDate,
          dto.genderId,
          dto.birthCountryId,
          dto.birthDepartmentId,
          dto.birthCityId,
          dto.residenceCountryId,
          dto.residenceDepartmentId,
          dto.residenceCityId,
          dto.educationLevelId,
          dto.educationInstitution,
          dto.categoryId,
          dto.weight,
          dto.height,
          dto.schoolId,
          dto.disciplineId,
          dto.email,
          dto.phone,
        ),
      );
    } catch (error) {
      if (
        error instanceof DocumentTypeNotFoundException ||
        error instanceof GenderNotFoundException ||
        error instanceof CountryNotFoundException ||
        error instanceof DepartmentNotFoundException ||
        error instanceof CityNotFoundException ||
        error instanceof EducationLevelNotFoundException ||
        error instanceof SchoolNotFoundException ||
        error instanceof DisciplineNotFoundException ||
        error instanceof CategoryNotFoundException
      ) {
        throw new NotFoundException(error.message);
      }
      if (
        error instanceof AthleteAlreadyExistsException ||
        error instanceof EmailAlreadyInUseException
      ) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }
}
