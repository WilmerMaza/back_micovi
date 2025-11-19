import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { UserRole } from 'src/domain/auth/entities/user-role.enum';
import { User } from 'src/domain/auth/entities/user.entity';
import { EmailAlreadyInUseException } from 'src/domain/auth/exceptions/email-already-in-use.exception';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import { PasswordHasher } from 'src/domain/auth/services/password-hasher.service';
import { School } from 'src/domain/school/entities/school.entity';
import { UnitOfWork } from 'src/domain/shared/unit-of-work';
import { SchoolDto } from '../../dto/school.dto';
import { RegisterSchoolCommand } from '../register-school.command';

@CommandHandler(RegisterSchoolCommand)
export class RegisterSchoolHandler implements ICommandHandler<RegisterSchoolCommand, SchoolDto> {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: RegisterSchoolCommand): Promise<SchoolDto> {
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new EmailAlreadyInUseException(command.email);
    }

    const userId = randomUUID();
    const hashedPassword = await this.passwordHasher.hash(command.password);
    const user = new User(
      userId,
      command.email,
      hashedPassword,
      UserRole.SCHOOL,
      command.country,
      command.state,
      command.city,
      command.phone,
      command.address,
    );

    return this.unitOfWork.execute(
      async ({ userRepository: transactionalUserRepository, schoolRepository }) => {
        const createUser = await transactionalUserRepository.create(user);

        const school = new School(
          randomUUID(),
          command.name,
          createUser.id,
          command.character,
          command.headquarters,
          command.website,
          command.representativename,
        );
        const createdSchool = await schoolRepository.create(school);

        return {
          id: createdSchool.id,
          name: createdSchool.name,
          address: createUser.address ?? '',
          phone: createUser.phone ?? '',
          userId: createdSchool.userId,
        };
      },
    );
  }
}
