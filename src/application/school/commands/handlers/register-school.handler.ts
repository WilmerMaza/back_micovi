import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';
import { UserRole } from 'src/domain/auth/entities/user-role.enum';
import { User } from 'src/domain/auth/entities/user.entity';
import { EmailAlreadyInUseException } from 'src/domain/auth/exceptions/email-already-in-use.exception';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import { PasswordHasher } from 'src/domain/auth/services/password-hasher.service';
import { School } from 'src/domain/school/entities/school.entity';
import { Category } from 'src/domain/school/entities/category.entity';
import { SchoolRepository } from 'src/domain/school/repositories/school.repository';
import { SportDisciplineRepository } from 'src/domain/school/repositories/sport-discipline.repository';
import { DisciplineNotFoundException } from 'src/domain/school/exceptions/discipline-not-found.exception';
import { NameAlreadyInUseException } from 'src/domain/school/exceptions/name-already-in-use.exception';
import { TaxIdAlreadyInUseException } from 'src/domain/school/exceptions/tax-id-already-in-use.exception';
import { UnitOfWork } from 'src/domain/shared/unit-of-work';
import { CategoryDto } from '../../dto/category.dto';
import { SchoolDto } from '../../dto/school.dto';
import { SportDisciplineDto } from '../../dto/sport-discipline.dto';
import { RegisterSchoolCommand } from '../register-school.command';

@CommandHandler(RegisterSchoolCommand)
export class RegisterSchoolHandler implements ICommandHandler<RegisterSchoolCommand, SchoolDto> {
  private readonly logger = new Logger(RegisterSchoolHandler.name);

  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly schoolRepository: SchoolRepository,
    private readonly sportDisciplineRepository: SportDisciplineRepository,
  ) {}

  async execute(command: RegisterSchoolCommand): Promise<SchoolDto> {
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      this.logger.warn(`Registration blocked: email already in use — ${command.email}`);
      throw new EmailAlreadyInUseException(command.email);
    }

    const existingSchoolByTaxId = await this.schoolRepository.findByTaxId(command.taxId);
    if (existingSchoolByTaxId) {
      this.logger.warn(`Registration blocked: taxId already in use — ${command.taxId}`);
      throw new TaxIdAlreadyInUseException(command.taxId);
    }

    const existingSchoolByName = await this.schoolRepository.findByName(command.name);
    if (existingSchoolByName) {
      this.logger.warn(`Registration blocked: institution name already in use — ${command.name}`);
      throw new NameAlreadyInUseException(command.name);
    }

    const names = command.categories.map((c) => c.name.toLowerCase().trim());
    const uniqueNames = new Set(names);
    if (uniqueNames.size !== names.length) {
      const duplicates = names.filter((n, i) => names.indexOf(n) !== i);
      throw new Error(`Duplicate category names: ${[...new Set(duplicates)].join(', ')}`);
    }

    const userId = randomUUID();
    const hashedPassword = await this.passwordHasher.hash(command.password);
    const user = new User(
      userId,
      command.email,
      hashedPassword,
      UserRole.SCHOOL,
      null,
      null,
      null,
      null,
      null,
    );

    const found = await this.sportDisciplineRepository.findAllByIds(command.disciplineIds);
    if (found.length !== command.disciplineIds.length) {
      const foundIds = new Set(found.map((d) => d.id));
      const missingId = command.disciplineIds.find((id) => !foundIds.has(id));
      throw new DisciplineNotFoundException(missingId!);
    }

    this.logger.log(`Registering institution: ${command.name} (taxId: ${command.taxId})`);

    return this.unitOfWork.execute(
      async ({
        userRepository: txUserRepo,
        schoolRepository: txSchoolRepo,
        categoryRepository: txCategoryRepo,
        sportDisciplineRepository: txDisciplineRepo,
      }) => {
        const createdUser = await txUserRepo.create(user);

        const school = new School(
          randomUUID(),
          command.name,
          createdUser.id,
          command.character,
          command.institutionType,
          command.taxId,
          command.phone,
          command.address,
          command.country,
          command.state,
          command.city,
          command.headquarters,
          command.website ?? null,
          command.representativename,
          command.logo,
          command.foundationDate,
          command.latitude,
          command.longitude,
        );
        const createdSchool = await txSchoolRepo.create(school);

        const createdCategories = await Promise.all(
          command.categories.map((cat) =>
            txCategoryRepo.create(
              new Category(
                randomUUID(),
                cat.name,
                createdSchool.id,
                cat.minAge ?? null,
                cat.maxAge ?? null,
              ),
            ),
          ),
        );

        for (const discipline of found) {
          await txDisciplineRepo.addSchoolDiscipline(createdSchool.id, discipline.id);
        }

        this.logger.log(`Institution registered successfully: ${createdSchool.id}`);

        return new SchoolDto(
          createdSchool.id,
          createdSchool.name,
          command.address,
          command.phone,
          createdSchool.userId,
          createdSchool.taxId,
          createdSchool.character,
          createdSchool.institutionType,
          createdSchool.country,
          createdSchool.state,
          createdSchool.city,
          createdSchool.headquarters,
          createdSchool.website,
          createdSchool.representativename,
          createdSchool.logo,
          createdSchool.foundationDate,
          createdSchool.latitude,
          createdSchool.longitude,
          createdCategories.map((c) => new CategoryDto(c.id, c.name, c.minAge, c.maxAge)),
          found.map((d) => new SportDisciplineDto(d.id, d.name)),
        );
      },
    );
  }
}
