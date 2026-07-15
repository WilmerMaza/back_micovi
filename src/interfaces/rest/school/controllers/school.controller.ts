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
import { RegisterSchoolCommand } from 'src/application/school/commands/register-school.command';
import { SchoolDto } from 'src/application/school/dto/school.dto';
import { EmailAlreadyInUseException } from 'src/domain/auth/exceptions/email-already-in-use.exception';
import { DisciplineNotFoundException } from 'src/domain/school/exceptions/discipline-not-found.exception';
import { NameAlreadyInUseException } from 'src/domain/school/exceptions/name-already-in-use.exception';
import { TaxIdAlreadyInUseException } from 'src/domain/school/exceptions/tax-id-already-in-use.exception';
import { RegisterSchoolDto } from '../dtos/register-school.dto';

@ApiTags('Instituciones')
@Controller('api/instituciones')
export class SchoolController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @ApiOperation({
    summary: 'Register a new sports institution',
    description:
      'Creates a new sports institution along with its associated user account. Requires at least one sport discipline and one age category. Supports geolocation and logo.',
  })
  @ApiBody({
    type: RegisterSchoolDto,
    description: 'Payload for registering a new sports institution',
  })
  @ApiCreatedResponse({
    description: 'Institution registered successfully',
    type: SchoolDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation error',
  })
  @ApiConflictResponse({
    description: 'Email, Tax ID or institution name is already in use',
  })
  @ApiNotFoundResponse({
    description: 'One or more sport disciplines were not found',
  })
  async register(@Body() dto: RegisterSchoolDto): Promise<SchoolDto> {
    try {
      return await this.commandBus.execute(
        new RegisterSchoolCommand(
          dto.name,
          dto.address,
          dto.phone,
          dto.email,
          dto.password,
          dto.character,
          dto.institutionType,
          dto.taxId,
          dto.headquarters,
          dto.country,
          dto.state,
          dto.city,
          dto.website ?? null,
          dto.representativename,
          dto.disciplineIds,
          dto.categories.map((c) => ({
            name: c.name,
            minAge: c.minAge,
            maxAge: c.maxAge,
          })),
          dto.logo ?? null,
          dto.foundationDate ? new Date(dto.foundationDate) : null,
          dto.latitude ?? null,
          dto.longitude ?? null,
        ),
      );
    } catch (error) {
      if (error instanceof EmailAlreadyInUseException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof TaxIdAlreadyInUseException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof NameAlreadyInUseException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof DisciplineNotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
