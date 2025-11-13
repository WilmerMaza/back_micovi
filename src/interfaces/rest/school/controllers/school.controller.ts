import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterSchoolCommand } from 'src/application/school/commands/register-school.command';
import { SchoolDto } from 'src/application/school/dto/school.dto';
import { RegisterSchoolDto } from '../dtos/register-school.dto';

@Controller('schools')
export class SchoolController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async register(@Body() dto: RegisterSchoolDto): Promise<SchoolDto> {
    return this.commandBus.execute(
      new RegisterSchoolCommand(dto.name, dto.address, dto.phone, dto.email, dto.password),
    );
  }
}
