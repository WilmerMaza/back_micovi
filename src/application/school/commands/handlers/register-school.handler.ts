import { ConflictException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { UserRole } from 'src/domain/auth/entities/user-role.enum';
import { User } from 'src/domain/auth/entities/user.entity';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import { PasswordHasher } from 'src/domain/auth/services/password-hasher.service';
import { School } from 'src/domain/school/entities/school.entity';
import { SchoolRepository } from 'src/domain/school/repositories/school.repository';
import { SchoolDto } from '../../dto/school.dto';
import { RegisterSchoolCommand } from '../register-school.command';

@CommandHandler(RegisterSchoolCommand)
export class RegisterSchoolHandler implements ICommandHandler<RegisterSchoolCommand, SchoolDto> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly schoolRepository: SchoolRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: RegisterSchoolCommand): Promise<SchoolDto> {
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new ConflictException('The provided email is already registered');
    }

    const userId = randomUUID();
    const hashedPassword = await this.passwordHasher.hash(command.password);
    const user = new User(userId, command.email, hashedPassword, UserRole.SCHOOL);
    await this.userRepository.create(user);

    const school = new School(randomUUID(), command.name, command.address, command.phone, user.id);
    const createdSchool = await this.schoolRepository.create(school);

    return {
      id: createdSchool.id,
      name: createdSchool.name,
      address: createdSchool.address,
      phone: createdSchool.phone,
      userId: createdSchool.userId,
    };
  }
}
