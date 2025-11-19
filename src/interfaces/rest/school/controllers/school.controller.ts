import { Body, ConflictException, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterSchoolCommand } from 'src/application/school/commands/register-school.command';
import { SchoolDto } from 'src/application/school/dto/school.dto';
import { EmailAlreadyInUseException } from 'src/domain/auth/exceptions/email-already-in-use.exception';
import { RegisterSchoolDto } from '../dtos/register-school.dto';

@ApiTags('Schools')
@Controller('schools')
export class SchoolController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new sports school',
    description:
      'Creates a new school along with its associated user account. Requires name, address, phone, email, and password.',
  })
  @ApiBody({
    type: RegisterSchoolDto,
    description: 'Payload for registering a new school',
  })
  @ApiCreatedResponse({
    description: 'School registered successfully',
    type: SchoolDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation error',
  })
  @ApiConflictResponse({
    description: 'Email is already in use',
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
          dto.country,
          dto.state,
          dto.city,
          dto.headquarters,
          dto.website,
          dto.representativename,
        ),
      );
    } catch (error) {
      if (error instanceof EmailAlreadyInUseException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }
}
