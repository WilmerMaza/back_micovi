import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { UserRole } from 'src/domain/auth/entities/user-role.enum';
import { User } from 'src/domain/auth/entities/user.entity';
import { EmailAlreadyInUseException } from 'src/domain/auth/exceptions/email-already-in-use.exception';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import { PasswordHasher } from 'src/domain/auth/services/password-hasher.service';
import { Coach } from 'src/domain/coach/entities/coach.entity';
import { UnitOfWork } from 'src/domain/shared/unit-of-work';
import { CoachDto } from '../../dto/coach.dto';
import { RegisterCoachCommand } from '../register-coach.command';

@CommandHandler(RegisterCoachCommand)
export class RegisterCoachHandler implements ICommandHandler<RegisterCoachCommand, CoachDto> {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: RegisterCoachCommand): Promise<CoachDto> {
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
      UserRole.COACH,
      command.country || null,
      command.state || null,
      command.city || null,
      command.phone || null,
      null, // address is null for coach
    );

    return this.unitOfWork.execute(
      async ({ userRepository: transactionalUserRepository, coachRepository }) => {
        const createUser = await transactionalUserRepository.create(user);

        const coach = new Coach(
          randomUUID(),
          command.name,
          command.specialty,
          createUser.id,
          command.schoolId,
        );
        const createdCoach = await coachRepository.create(coach);

        return {
          id: createdCoach.id,
          name: createdCoach.name,
          specialty: createdCoach.specialty,
          userId: createdCoach.userId,
          schoolId: createdCoach.schoolId,
        };
      },
    );
  }
}
