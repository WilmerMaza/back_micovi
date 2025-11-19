import { EmailAlreadyInUseException } from 'src/domain/auth/exceptions/email-already-in-use.exception';
import { PasswordHasher } from 'src/domain/auth/services/password-hasher.service';
import { schoolCharacter } from 'src/domain/school/entities/school-chacharacter.enum';
import { School } from 'src/domain/school/entities/school.entity';
import { UnitOfWork, UnitOfWorkRepositories } from 'src/domain/shared/unit-of-work';
import { RegisterSchoolCommand } from '../register-school.command';
import { RegisterSchoolHandler } from './register-school.handler';

describe('RegisterSchoolHandler', () => {
  const command = new RegisterSchoolCommand(
    'My School',
    'Main St',
    '5551234',
    'team@example.com',
    'Secret123',
    schoolCharacter.PRIVATE,
    'Downtown HQ',
    'CO',
    'Antioquia',
    'Medellin',
    'myschool.com',
    'Jane Doe',
  );

  function createUnitOfWorkMock(
    reposFactory: () => UnitOfWorkRepositories,
  ): jest.Mocked<UnitOfWork> {
    return {
      execute: jest.fn((work) => work(reposFactory())),
    } as unknown as jest.Mocked<UnitOfWork>;
  }

  function createPasswordHasherMock(): jest.Mocked<PasswordHasher> {
    return {
      hash: jest.fn(),
      compare: jest.fn(),
    };
  }

  it('persists user and school inside a transaction', async () => {
    const passwordHasher = createPasswordHasherMock();
    passwordHasher.hash.mockResolvedValue('hashed');

    const lookupUserRepository = {
      findByEmail: jest.fn().mockResolvedValue(null),
    };
    const transactionalUserRepository = {
      create: jest.fn().mockResolvedValue({
        id: 'user-id',
        address: command.address,
        phone: command.phone,
      }),
    };
    const createdSchool = new School(
      'school-id',
      command.name,
      'user-id',
      command.character,
      command.headquarters,
      command.website,
      command.representativename,
    );
    const schoolRepository = {
      create: jest.fn().mockResolvedValue(createdSchool),
    };

    const unitOfWork = createUnitOfWorkMock(() => ({
      userRepository: transactionalUserRepository as any,
      schoolRepository: schoolRepository as any,
    }));

    const handler = new RegisterSchoolHandler(
      unitOfWork,
      lookupUserRepository as any,
      passwordHasher,
    );

    const result = await handler.execute(command);

    expect(result).toEqual({
      id: createdSchool.id,
      name: createdSchool.name,
      address: command.address,
      phone: command.phone,
      userId: createdSchool.userId,
    });
    expect(lookupUserRepository.findByEmail).toHaveBeenCalledWith(command.email);
    expect(passwordHasher.hash).toHaveBeenCalledWith(command.password);
    expect(transactionalUserRepository.create).toHaveBeenCalledTimes(1);
    expect(schoolRepository.create).toHaveBeenCalledTimes(1);
    expect(unitOfWork.execute).toHaveBeenCalledTimes(1);
  });

  it('throws when email already exists and avoids writes', async () => {
    const passwordHasher = createPasswordHasherMock();
    const lookupUserRepository = {
      findByEmail: jest.fn().mockResolvedValue({ id: 'existing-user' }),
    };
    const transactionalUserRepository = {
      create: jest.fn(),
    };
    const schoolRepository = {
      create: jest.fn(),
    };
    const unitOfWork = createUnitOfWorkMock(() => ({
      userRepository: transactionalUserRepository as any,
      schoolRepository: schoolRepository as any,
    }));

    const handler = new RegisterSchoolHandler(
      unitOfWork,
      lookupUserRepository as any,
      passwordHasher,
    );

    await expect(handler.execute(command)).rejects.toBeInstanceOf(EmailAlreadyInUseException);
    expect(unitOfWork.execute).not.toHaveBeenCalled();
    expect(transactionalUserRepository.create).not.toHaveBeenCalled();
    expect(schoolRepository.create).not.toHaveBeenCalled();
    expect(passwordHasher.hash).not.toHaveBeenCalled();
  });
});
