import { EmailAlreadyInUseException } from 'src/domain/auth/exceptions/email-already-in-use.exception';
import { PasswordHasher } from 'src/domain/auth/services/password-hasher.service';
import { Category } from 'src/domain/school/entities/category.entity';
import { InstitutionType } from 'src/domain/school/entities/institution-type.enum';
import { schoolCharacter } from 'src/domain/school/entities/school-chacharacter.enum';
import { School } from 'src/domain/school/entities/school.entity';
import { SportDiscipline } from 'src/domain/school/entities/sport-discipline.entity';
import { DisciplineNotFoundException } from 'src/domain/school/exceptions/discipline-not-found.exception';
import { NameAlreadyInUseException } from 'src/domain/school/exceptions/name-already-in-use.exception';
import { TaxIdAlreadyInUseException } from 'src/domain/school/exceptions/tax-id-already-in-use.exception';
import { SchoolRepository } from 'src/domain/school/repositories/school.repository';
import { SportDisciplineRepository } from 'src/domain/school/repositories/sport-discipline.repository';
import { UnitOfWork, UnitOfWorkRepositories } from 'src/domain/shared/unit-of-work';
import { CategoryDto } from '../../dto/category.dto';
import { SchoolDto } from '../../dto/school.dto';
import { SportDisciplineDto } from '../../dto/sport-discipline.dto';
import { RegisterSchoolCommand } from '../register-school.command';
import { RegisterSchoolHandler } from './register-school.handler';

function makeCommand(overrides?: Partial<RegisterSchoolCommand>): RegisterSchoolCommand {
  return new RegisterSchoolCommand(
    overrides?.name ?? 'My School',
    overrides?.address ?? 'Main St 123',
    overrides?.phone ?? '5551234',
    overrides?.email ?? 'team@example.com',
    overrides?.password ?? 'Secret123',
    overrides?.character ?? schoolCharacter.PRIVATE,
    overrides?.institutionType ?? InstitutionType.ACADEMY,
    overrides?.taxId ?? '901123456-7',
    overrides?.headquarters ?? 'Downtown HQ',
    overrides?.country ?? 'CO',
    overrides?.state ?? 'Antioquia',
    overrides?.city ?? 'Medellin',
    overrides?.website ?? null,
    overrides?.representativename ?? 'Jane Doe',
    overrides?.disciplineIds ?? [],
    overrides?.categories ?? [],
    overrides?.logo ?? null,
    overrides?.foundationDate ?? null,
    overrides?.latitude ?? null,
    overrides?.longitude ?? null,
  );
}

function createUnitOfWorkMock(
  reposFactory: () => Partial<UnitOfWorkRepositories>,
): jest.Mocked<UnitOfWork> {
  return {
    execute: jest.fn((work) => work(reposFactory() as UnitOfWorkRepositories)),
  } as unknown as jest.Mocked<UnitOfWork>;
}

function createPasswordHasherMock(): jest.Mocked<PasswordHasher> {
  return {
    hash: jest.fn(),
    compare: jest.fn(),
  };
}

function createSchool(id: string, userId: string, command: RegisterSchoolCommand): School {
  return new School(
    id,
    command.name,
    userId,
    command.character,
    command.institutionType,
    command.taxId,
    command.phone,
    command.address,
    command.country,
    command.state,
    command.city,
    command.headquarters,
    command.website,
    command.representativename,
    command.logo,
    command.foundationDate,
    command.latitude,
    command.longitude,
  );
}

describe('RegisterSchoolHandler', () => {
  const command = makeCommand();

  it('persists user, school, categories and discipline links inside a transaction', async () => {
    const passwordHasher = createPasswordHasherMock();
    passwordHasher.hash.mockResolvedValue('hashed');

    const lookupUserRepository = { findByEmail: jest.fn().mockResolvedValue(null) };
    const lookupSchoolRepository = {
      findByTaxId: jest.fn().mockResolvedValue(null),
      findByName: jest.fn().mockResolvedValue(null),
    };
    const discipline = new SportDiscipline('disc-1', 'Fútbol', null);
    const lookupDisciplineRepo = { findAllByIds: jest.fn().mockResolvedValue([discipline]) };

    const cmd = makeCommand({
      disciplineIds: ['disc-1'],
      categories: [{ name: 'Infantil', minAge: 6, maxAge: 12 }],
    });

    const txUserRepo = { create: jest.fn().mockResolvedValue({ id: 'user-id' }) };
    const txSchoolRepo = {
      create: jest
        .fn()
        .mockImplementation((school: School) =>
          Promise.resolve(createSchool('school-id', 'user-id', cmd)),
        ),
    };
    const txCategoryRepo = {
      create: jest.fn().mockImplementation((cat: Category) => Promise.resolve(cat)),
    };
    const txDisciplineRepo = { addSchoolDiscipline: jest.fn().mockResolvedValue(undefined) };

    const unitOfWork = createUnitOfWorkMock(() => ({
      userRepository: txUserRepo as any,
      schoolRepository: txSchoolRepo as any,
      categoryRepository: txCategoryRepo as any,
      sportDisciplineRepository: txDisciplineRepo as any,
    }));

    const handler = new RegisterSchoolHandler(
      unitOfWork,
      lookupUserRepository as any,
      passwordHasher,
      lookupSchoolRepository as any,
      lookupDisciplineRepo as any,
    );

    const result = await handler.execute(cmd);

    expect(result).toBeInstanceOf(SchoolDto);
    expect(result.id).toBe('school-id');
    expect(result.name).toBe(cmd.name);
    expect(result.taxId).toBe(cmd.taxId);
    expect(result.character).toBe(cmd.character);
    expect(result.institutionType).toBe(cmd.institutionType);
    expect(result.headquarters).toBe(cmd.headquarters);
    expect(result.website).toBeNull();
    expect(result.representativename).toBe(cmd.representativename);
    expect(result.categories).toHaveLength(1);
    expect(result.categories[0].name).toBe('Infantil');
    expect(result.categories[0]).toBeInstanceOf(CategoryDto);
    expect(result.disciplines).toHaveLength(1);
    expect(result.disciplines[0].name).toBe('Fútbol');
    expect(result.disciplines[0]).toBeInstanceOf(SportDisciplineDto);

    expect(lookupUserRepository.findByEmail).toHaveBeenCalledWith(cmd.email);
    expect(lookupSchoolRepository.findByTaxId).toHaveBeenCalledWith(cmd.taxId);
    expect(lookupDisciplineRepo.findAllByIds).toHaveBeenCalledWith(['disc-1']);
    expect(passwordHasher.hash).toHaveBeenCalledWith(cmd.password);
    expect(txUserRepo.create).toHaveBeenCalledTimes(1);
    expect(txSchoolRepo.create).toHaveBeenCalledTimes(1);
    expect(txCategoryRepo.create).toHaveBeenCalledTimes(1);
    expect(txDisciplineRepo.addSchoolDiscipline).toHaveBeenCalledWith('school-id', 'disc-1');
    expect(unitOfWork.execute).toHaveBeenCalledTimes(1);
  });

  it('returns all SchoolDto fields populated', async () => {
    const passwordHasher = createPasswordHasherMock();
    passwordHasher.hash.mockResolvedValue('hashed');

    const lookupUserRepository = { findByEmail: jest.fn().mockResolvedValue(null) };
    const lookupSchoolRepository = {
      findByTaxId: jest.fn().mockResolvedValue(null),
      findByName: jest.fn().mockResolvedValue(null),
    };
    const discipline = new SportDiscipline('disc-1', 'Fútbol', null);
    const lookupDisciplineRepo = { findAllByIds: jest.fn().mockResolvedValue([discipline]) };

    const foundationDate = new Date('2024-01-15');
    const cmd = makeCommand({
      disciplineIds: ['disc-1'],
      categories: [{ name: 'Infantil', minAge: 6, maxAge: 12 }],
      logo: 'https://example.com/logo.png',
      foundationDate,
      latitude: 10.4806,
      longitude: -66.9036,
    });

    const txUserRepo = { create: jest.fn().mockResolvedValue({ id: 'user-id' }) };
    const txSchoolRepo = {
      create: jest
        .fn()
        .mockImplementation((school: School) =>
          Promise.resolve(createSchool('school-id', 'user-id', cmd)),
        ),
    };
    const txCategoryRepo = {
      create: jest.fn().mockImplementation((cat: Category) => Promise.resolve(cat)),
    };
    const txDisciplineRepo = { addSchoolDiscipline: jest.fn() };

    const unitOfWork = createUnitOfWorkMock(() => ({
      userRepository: txUserRepo as any,
      schoolRepository: txSchoolRepo as any,
      categoryRepository: txCategoryRepo as any,
      sportDisciplineRepository: txDisciplineRepo as any,
    }));

    const handler = new RegisterSchoolHandler(
      unitOfWork,
      lookupUserRepository as any,
      passwordHasher,
      lookupSchoolRepository as any,
      lookupDisciplineRepo as any,
    );

    const result = await handler.execute(cmd);

    expect(result.id).toBe('school-id');
    expect(result.name).toBe(cmd.name);
    expect(result.address).toBe(cmd.address);
    expect(result.phone).toBe(cmd.phone);
    expect(result.userId).toBe('user-id');
    expect(result.taxId).toBe(cmd.taxId);
    expect(result.character).toBe(cmd.character);
    expect(result.institutionType).toBe(cmd.institutionType);
    expect(result.country).toBe(cmd.country);
    expect(result.state).toBe(cmd.state);
    expect(result.city).toBe(cmd.city);
    expect(result.headquarters).toBe(cmd.headquarters);
    expect(result.website).toBeNull();
    expect(result.representativename).toBe(cmd.representativename);
    expect(result.logo).toBe(cmd.logo);
    expect(result.foundationDate).toEqual(cmd.foundationDate);
    expect(result.latitude).toBe(cmd.latitude);
    expect(result.longitude).toBe(cmd.longitude);
    expect(result.categories).toHaveLength(1);
    expect(result.disciplines).toHaveLength(1);
  });

  it('creates multiple categories when provided', async () => {
    const passwordHasher = createPasswordHasherMock();
    passwordHasher.hash.mockResolvedValue('hashed');

    const lookupUserRepository = { findByEmail: jest.fn().mockResolvedValue(null) };
    const lookupSchoolRepository = {
      findByTaxId: jest.fn().mockResolvedValue(null),
      findByName: jest.fn().mockResolvedValue(null),
    };
    const discipline = new SportDiscipline('disc-1', 'Fútbol', null);
    const lookupDisciplineRepo = { findAllByIds: jest.fn().mockResolvedValue([discipline]) };

    const cmd = makeCommand({
      categories: [
        { name: 'Infantil A', minAge: 6, maxAge: 8 },
        { name: 'Infantil B', minAge: 9, maxAge: 12 },
        { name: 'Juvenil', minAge: 13, maxAge: 17 },
      ],
      disciplineIds: ['disc-1'],
    });

    const txUserRepo = { create: jest.fn().mockResolvedValue({ id: 'user-id' }) };
    const txSchoolRepo = {
      create: jest
        .fn()
        .mockImplementation((school: School) =>
          Promise.resolve(createSchool('school-id', 'user-id', cmd)),
        ),
    };
    const txCategoryRepo = {
      create: jest.fn().mockImplementation((cat: Category) => Promise.resolve(cat)),
    };
    const txDisciplineRepo = { addSchoolDiscipline: jest.fn() };

    const unitOfWork = createUnitOfWorkMock(() => ({
      userRepository: txUserRepo as any,
      schoolRepository: txSchoolRepo as any,
      categoryRepository: txCategoryRepo as any,
      sportDisciplineRepository: txDisciplineRepo as any,
    }));

    const handler = new RegisterSchoolHandler(
      unitOfWork,
      lookupUserRepository as any,
      passwordHasher,
      lookupSchoolRepository as any,
      lookupDisciplineRepo as any,
    );

    const result = await handler.execute(cmd);

    expect(result.categories).toHaveLength(3);
    expect(result.categories[0].name).toBe('Infantil A');
    expect(result.categories[0].minAge).toBe(6);
    expect(result.categories[0].maxAge).toBe(8);
    expect(result.categories[2].name).toBe('Juvenil');
    expect(txCategoryRepo.create).toHaveBeenCalledTimes(3);
    expect(txDisciplineRepo.addSchoolDiscipline).toHaveBeenCalledWith('school-id', 'disc-1');
  });

  it('throws EmailAlreadyInUseException when email already exists and avoids writes', async () => {
    const passwordHasher = createPasswordHasherMock();
    const lookupUserRepository = { findByEmail: jest.fn().mockResolvedValue({ id: 'existing' }) };
    const lookupSchoolRepository = { findByTaxId: jest.fn() };
    const lookupDisciplineRepo = { findAllByIds: jest.fn() };

    const txUserRepo = { create: jest.fn() };
    const txSchoolRepo = { create: jest.fn() };
    const txCategoryRepo = { create: jest.fn() };
    const txDisciplineRepo = { addSchoolDiscipline: jest.fn() };

    const unitOfWork = createUnitOfWorkMock(() => ({
      userRepository: txUserRepo as any,
      schoolRepository: txSchoolRepo as any,
      categoryRepository: txCategoryRepo as any,
      sportDisciplineRepository: txDisciplineRepo as any,
    }));

    const handler = new RegisterSchoolHandler(
      unitOfWork,
      lookupUserRepository as any,
      passwordHasher,
      lookupSchoolRepository as any,
      lookupDisciplineRepo as any,
    );

    await expect(handler.execute(command)).rejects.toBeInstanceOf(EmailAlreadyInUseException);
    expect(unitOfWork.execute).not.toHaveBeenCalled();
    expect(txUserRepo.create).not.toHaveBeenCalled();
    expect(txSchoolRepo.create).not.toHaveBeenCalled();
    expect(passwordHasher.hash).not.toHaveBeenCalled();
  });

  it('throws TaxIdAlreadyInUseException when tax id already exists and avoids writes', async () => {
    const passwordHasher = createPasswordHasherMock();
    const lookupUserRepository = { findByEmail: jest.fn().mockResolvedValue(null) };
    const lookupSchoolRepository = {
      findByTaxId: jest.fn().mockResolvedValue({ id: 'existing-school', taxId: command.taxId }),
    };
    const lookupDisciplineRepo = { findAllByIds: jest.fn() };

    const txUserRepo = { create: jest.fn() };
    const txSchoolRepo = { create: jest.fn() };
    const txCategoryRepo = { create: jest.fn() };
    const txDisciplineRepo = { addSchoolDiscipline: jest.fn() };

    const unitOfWork = createUnitOfWorkMock(() => ({
      userRepository: txUserRepo as any,
      schoolRepository: txSchoolRepo as any,
      categoryRepository: txCategoryRepo as any,
      sportDisciplineRepository: txDisciplineRepo as any,
    }));

    const handler = new RegisterSchoolHandler(
      unitOfWork,
      lookupUserRepository as any,
      passwordHasher,
      lookupSchoolRepository as any,
      lookupDisciplineRepo as any,
    );

    await expect(handler.execute(command)).rejects.toBeInstanceOf(TaxIdAlreadyInUseException);
    expect(unitOfWork.execute).not.toHaveBeenCalled();
    expect(passwordHasher.hash).not.toHaveBeenCalled();
  });

  it('throws DisciplineNotFoundException when a discipline ID does not exist', async () => {
    const passwordHasher = createPasswordHasherMock();
    passwordHasher.hash.mockResolvedValue('hashed');

    const lookupUserRepository = { findByEmail: jest.fn().mockResolvedValue(null) };
    const lookupSchoolRepository = {
      findByTaxId: jest.fn().mockResolvedValue(null),
      findByName: jest.fn().mockResolvedValue(null),
    };
    const lookupDisciplineRepo = {
      findAllByIds: jest.fn().mockResolvedValue([new SportDiscipline('disc-1', 'Fútbol', null)]),
    };

    const cmd = makeCommand({ disciplineIds: ['disc-1', 'disc-missing'] });

    const handler = new RegisterSchoolHandler(
      createUnitOfWorkMock(() => ({})),
      lookupUserRepository as any,
      passwordHasher,
      lookupSchoolRepository as any,
      lookupDisciplineRepo as any,
    );

    await expect(handler.execute(cmd)).rejects.toBeInstanceOf(DisciplineNotFoundException);
  });

  it('handles optional fields: logo, foundationDate, latitude, longitude', async () => {
    const passwordHasher = createPasswordHasherMock();
    passwordHasher.hash.mockResolvedValue('hashed');

    const lookupUserRepository = { findByEmail: jest.fn().mockResolvedValue(null) };
    const lookupSchoolRepository = {
      findByTaxId: jest.fn().mockResolvedValue(null),
      findByName: jest.fn().mockResolvedValue(null),
    };
    const discipline = new SportDiscipline('disc-1', 'Fútbol', null);
    const lookupDisciplineRepo = { findAllByIds: jest.fn().mockResolvedValue([discipline]) };

    const foundationDate = new Date('2024-01-15');
    const cmd = makeCommand({
      logo: 'https://example.com/logo.png',
      foundationDate,
      latitude: 10.4806,
      longitude: -66.9036,
      disciplineIds: ['disc-1'],
      categories: [{ name: 'Infantil', minAge: 6, maxAge: 12 }],
    });

    const txUserRepo = { create: jest.fn().mockResolvedValue({ id: 'user-id' }) };
    const txSchoolRepo = {
      create: jest
        .fn()
        .mockImplementation((school: School) =>
          Promise.resolve(createSchool('school-id', 'user-id', cmd)),
        ),
    };
    const txCategoryRepo = {
      create: jest.fn().mockImplementation((cat: Category) => Promise.resolve(cat)),
    };
    const txDisciplineRepo = { addSchoolDiscipline: jest.fn() };

    const unitOfWork = createUnitOfWorkMock(() => ({
      userRepository: txUserRepo as any,
      schoolRepository: txSchoolRepo as any,
      categoryRepository: txCategoryRepo as any,
      sportDisciplineRepository: txDisciplineRepo as any,
    }));

    const handler = new RegisterSchoolHandler(
      unitOfWork,
      lookupUserRepository as any,
      passwordHasher,
      lookupSchoolRepository as any,
      lookupDisciplineRepo as any,
    );

    const result = await handler.execute(cmd);

    expect(result.logo).toBe('https://example.com/logo.png');
    expect(result.foundationDate).toEqual(foundationDate);
    expect(result.latitude).toBe(10.4806);
    expect(result.longitude).toBe(-66.9036);

    const createdSchoolArg = txSchoolRepo.create.mock.calls[0][0] as School;
    expect(createdSchoolArg.logo).toBe('https://example.com/logo.png');
    expect(createdSchoolArg.foundationDate).toEqual(foundationDate);
    expect(createdSchoolArg.latitude).toBe(10.4806);
    expect(createdSchoolArg.longitude).toBe(-66.9036);
  });
});
