import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserRepository } from '../src/domain/auth/repositories/user.repository';
import { SchoolRepository } from '../src/domain/school/repositories/school.repository';
import { UnitOfWork, UnitOfWorkRepositories } from '../src/domain/shared/unit-of-work';
import { PasswordHasher } from '../src/domain/auth/services/password-hasher.service';
import { User } from '../src/domain/auth/entities/user.entity';
import { UserRole } from '../src/domain/auth/entities/user-role.enum';
import { School } from '../src/domain/school/entities/school.entity';

class InMemoryUserRepository implements UserRepository {
  private usersByEmail = new Map<string, User>();

  async findByEmail(email: string): Promise<User | null> {
    return this.usersByEmail.get(email) ?? null;
  }

  async create(user: User): Promise<User> {
    this.usersByEmail.set(user.email, user);
    return user;
  }

  snapshot(): Map<string, User> {
    return new Map(this.usersByEmail);
  }

  restore(snapshot: Map<string, User>): void {
    this.usersByEmail = new Map(snapshot);
  }

  count(): number {
    return this.usersByEmail.size;
  }
}

class InMemorySchoolRepository implements SchoolRepository {
  private schools = new Map<string, School>();

  async create(school: School): Promise<School> {
    this.schools.set(school.id, school);
    return school;
  }

  snapshot(): Map<string, School> {
    return new Map(this.schools);
  }

  restore(snapshot: Map<string, School>): void {
    this.schools = new Map(snapshot);
  }

  count(): number {
    return this.schools.size;
  }
}

class InMemoryUnitOfWork implements UnitOfWork {
  constructor(
    private readonly userRepository: InMemoryUserRepository,
    private readonly schoolRepository: InMemorySchoolRepository,
  ) {}

  async execute<T>(work: (repositories: UnitOfWorkRepositories) => Promise<T>): Promise<T> {
    const userSnapshot = this.userRepository.snapshot();
    const schoolSnapshot = this.schoolRepository.snapshot();
    try {
      return await work({
        userRepository: this.userRepository,
        schoolRepository: this.schoolRepository,
      });
    } catch (error) {
      this.userRepository.restore(userSnapshot);
      this.schoolRepository.restore(schoolSnapshot);
      throw error;
    }
  }
}

class InMemoryPasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return `hashed:${plain}`;
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return hash === `hashed:${plain}`;
  }
}

describe('Auth & School flows (e2e)', () => {
  let app: INestApplication;
  let userRepository: InMemoryUserRepository;
  let schoolRepository: InMemorySchoolRepository;

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository();
    schoolRepository = new InMemorySchoolRepository();
    const unitOfWork = new InMemoryUnitOfWork(userRepository, schoolRepository);
    const passwordHasher = new InMemoryPasswordHasher();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UserRepository)
      .useValue(userRepository)
      .overrideProvider(SchoolRepository)
      .useValue(schoolRepository)
      .overrideProvider(UnitOfWork)
      .useValue(unitOfWork)
      .overrideProvider(PasswordHasher)
      .useValue(passwordHasher)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('registers a school and persists both user and school', async () => {
    const response = await request(app.getHttpServer())
      .post('/schools')
      .send({
        name: 'My Academy',
        address: 'Main St 123',
        phone: '5554444',
        email: 'academy@example.com',
        password: 'Secret123',
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        name: 'My Academy',
        address: 'Main St 123',
        phone: '5554444',
      }),
    );
    expect(userRepository.count()).toBe(1);
    expect(schoolRepository.count()).toBe(1);
  });

  it('prevents duplicate registrations and leaves state untouched', async () => {
    const payload = {
      name: 'My Academy',
      address: 'Main St 123',
      phone: '5554444',
      email: 'academy@example.com',
      password: 'Secret123',
    };

    await request(app.getHttpServer()).post('/schools').send(payload).expect(201);
    await request(app.getHttpServer()).post('/schools').send(payload).expect(409);

    expect(userRepository.count()).toBe(1);
    expect(schoolRepository.count()).toBe(1);
  });

  it('allows login after registration and rejects invalid credentials', async () => {
    const payload = {
      name: 'My Academy',
      address: 'Main St 123',
      phone: '5554444',
      email: 'academy@example.com',
      password: 'Secret123',
    };

    await request(app.getHttpServer()).post('/schools').send(payload).expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'academy@example.com', password: 'Secret123' })
      .expect(201);

    expect(loginResponse.body).toEqual(
      expect.objectContaining({
        email: 'academy@example.com',
        role: UserRole.SCHOOL,
      }),
    );

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'academy@example.com', password: 'WrongPass' })
      .expect(401);
  });
});
