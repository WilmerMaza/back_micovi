import { Body, ConflictException, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CoachDto } from 'src/application/coach/dto/coach.dto';
import { RegisterCoachCommand } from 'src/application/coach/commands/register-coach.command';
import { EmailAlreadyInUseException } from 'src/domain/auth/exceptions/email-already-in-use.exception';
import { RegisterCoachDto } from '../dtos/register-coach.dto';
import { JwtAuthGuard } from 'src/infrastructure/auth/http/guard/jwt-auth.guard';
import { RolesGuard } from 'src/infrastructure/auth/http/guard/roles.guard';
import { Roles } from 'src/infrastructure/auth/http/decorators/roles.decorator';
import { UserRole } from 'src/domain/auth/entities/user-role.enum';

@ApiTags('Coaches')
@Controller('coaches')
export class CoachController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SCHOOL)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new coach' })
  @ApiBody({ type: RegisterCoachDto })
  @ApiCreatedResponse({ type: CoachDto, description: 'Coach registered successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'Email already in use' })
  async register(@Body() dto: RegisterCoachDto): Promise<CoachDto> {
    try {
      return await this.commandBus.execute(
        new RegisterCoachCommand(
          dto.name,
          dto.email,
          dto.password,
          dto.specialty || '',
          dto.schoolId, // Should probably come from the logged-in School User
          dto.phone,
          dto.country,
          dto.state,
          dto.city,
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
