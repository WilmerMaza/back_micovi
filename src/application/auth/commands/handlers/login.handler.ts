import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PasswordHasher } from 'src/domain/auth/services/password-hasher.service';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import { InvalidCredentialsException } from 'src/domain/auth/exceptions/invalid-credentials.exception';
import { SchoolRepository } from 'src/domain/school/repositories/school.repository';
import { UserRole } from 'src/domain/auth/entities/user-role.enum';
import { AuthenticatedUserDto } from '../../dto/authenticated-user.dto';
import { LoginCommand } from '../login.command';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, AuthenticatedUserDto> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly schoolRepository: SchoolRepository,
  ) {}

  async execute(command: LoginCommand): Promise<AuthenticatedUserDto> {
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isValid = await this.passwordHasher.compare(command.password, user.password);
    if (!isValid) {
      throw new InvalidCredentialsException();
    }

    let schoolId: string | null = null;
    if (user.role === UserRole.SCHOOL) {
      const school = await this.schoolRepository.findByUserId(user.id);
      schoolId = school?.id ?? null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      schoolId,
    };
  }
}
