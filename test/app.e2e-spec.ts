import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthSession } from '../src/domain/auth/entities/auth-session.entity';
import {
  AuthSessionRepository,
  CreateAuthSessionInput,
} from '../src/domain/auth/repositories/auth-session.repository';
import { UserRepository } from '../src/domain/auth/repositories/user.repository';
import { SchoolRepository } from '../src/domain/school/repositories/school.repository';
import { UnitOfWork, UnitOfWorkRepositories } from '../src/domain/shared/unit-of-work';
import { PasswordHasher } from '../src/domain/auth/services/password-hasher.service';
import { User } from '../src/domain/auth/entities/user.entity';
import { UserRole } from '../src/domain/auth/entities/user-role.enum';
import { School } from '../src/domain/school/entities/school.entity';
import { PrismaService } from '../src/infrastructure/persistence/prisma.service';

class MockPrismaService {
  async onModuleInit(): Promise<void> {}
  async onModuleDestroy(): Promise<void> {}
}

class InMemoryUserRepository implements UserRepository {
  private usersByEmail = new Map<string, User>();
  private usersById = new Map<string, User>();

  async findByEmail(email: string): Promise<User | null> {
    return this.usersByEmail.get(email) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.usersById.get(id) ?? null;
  }

  async create(user: User): Promise<User> {
    this.usersByEmail.set(user.email, user);
    this.usersById.set(user.id, user);
    return user;
  }

  snapshot(): Map<string, User> {
    return new Map(this.usersByEmail);
  }

  restore(snapshot: Map<string, User>): void {
    this.usersByEmail = new Map(snapshot);
    this.usersById = new Map([...snapshot.values()].map((u) => [u.id, u]));
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

  async findById(id: string): Promise<School | null> {
    return this.schools.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<School | null> {
    for (const school of this.schools.values()) {
      if (school.userId === userId) {
        return school;
      }
    }
    return null;
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

class InMemoryAuthSessionRepository implements AuthSessionRepository {
  private sessions = new Map<string, AuthSession>();

  async create(input: CreateAuthSessionInput): Promise<AuthSession> {
    const now = new Date();
    const session = new AuthSession(
      input.id,
      input.userId,
      input.familyId,
      input.refreshTokenHash,
      input.userAgent ?? null,
      input.ipAddress ?? null,
      input.expiresAt,
      null,
      now,
      now,
    );
    this.sessions.set(session.id, session);
    return session;
  }

  async findByRefreshTokenHash(hash: string): Promise<AuthSession | null> {
    for (const session of this.sessions.values()) {
      if (session.refreshTokenHash === hash) {
        return session;
      }
    }
    return null;
  }

  async findActiveById(id: string): Promise<AuthSession | null> {
    const session = this.sessions.get(id);
    return session?.isActive ? session : null;
  }

  async revokeById(id: string): Promise<void> {
    const session = this.sessions.get(id);
    if (!session) return;
    this.sessions.set(
      id,
      new AuthSession(
        session.id,
        session.userId,
        session.familyId,
        session.refreshTokenHash,
        session.userAgent,
        session.ipAddress,
        session.expiresAt,
        new Date(),
        session.createdAt,
        new Date(),
      ),
    );
  }

  async revokeFamily(familyId: string): Promise<void> {
    for (const [id, session] of this.sessions) {
      if (session.familyId === familyId) {
        await this.revokeById(id);
      }
    }
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    for (const [id, session] of this.sessions) {
      if (session.userId === userId) {
        await this.revokeById(id);
      }
    }
  }

  async rotateRefreshToken(
    sessionId: string,
    newRefreshTokenHash: string,
    newExpiresAt: Date,
  ): Promise<AuthSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    const rotated = new AuthSession(
      session.id,
      session.userId,
      session.familyId,
      newRefreshTokenHash,
      session.userAgent,
      session.ipAddress,
      newExpiresAt,
      null,
      session.createdAt,
      new Date(),
    );
    this.sessions.set(sessionId, rotated);
    return rotated;
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
        planRepository: undefined as any,
        subscriptionRepository: undefined as any,
        coachRepository: undefined as any,
        athleteRepository: undefined as any,
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

function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api', { exclude: ['document', 'document-json'] });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
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
    const authSessionRepository = new InMemoryAuthSessionRepository();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UserRepository)
      .useValue(userRepository)
      .overrideProvider(SchoolRepository)
      .useValue(schoolRepository)
      .overrideProvider(AuthSessionRepository)
      .useValue(authSessionRepository)
      .overrideProvider(UnitOfWork)
      .useValue(unitOfWork)
      .overrideProvider(PasswordHasher)
      .useValue(passwordHasher)
      .overrideProvider(PrismaService)
      .useValue(new MockPrismaService())
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const registerPayload = {
    name: 'My Academy',
    address: 'Main St 123',
    phone: '5554444',
    country: 'Colombia',
    state: 'Bolivar',
    city: 'Cartagena',
    character: 'PUBLIC',
    headquarters: 'Sede Principal',
    website: 'https://academy.example.com',
    representativename: 'Juan Perez',
    email: 'academy@example.com',
    password: 'Secret123',
  };

  it('registers a school and persists both user and school', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/schools/register')
      .send(registerPayload)
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        name: 'My Academy',
      }),
    );
    expect(userRepository.count()).toBe(1);
    expect(schoolRepository.count()).toBe(1);
  });

  it('prevents duplicate registrations and leaves state untouched', async () => {
    await request(app.getHttpServer())
      .post('/api/schools/register')
      .send(registerPayload)
      .expect(201);
    await request(app.getHttpServer())
      .post('/api/schools/register')
      .send(registerPayload)
      .expect(409);

    expect(userRepository.count()).toBe(1);
    expect(schoolRepository.count()).toBe(1);
  });

  it('allows login after registration, sets cookies and rejects invalid credentials', async () => {
    await request(app.getHttpServer())
      .post('/api/schools/register')
      .send(registerPayload)
      .expect(201);

    const agent = request.agent(app.getHttpServer());
    const loginResponse = await agent
      .post('/api/auth/login')
      .send({ email: 'academy@example.com', password: 'Secret123' })
      .expect(201);

    expect(loginResponse.body).toEqual(
      expect.objectContaining({
        email: 'academy@example.com',
        role: UserRole.SCHOOL,
      }),
    );
    expect(loginResponse.body).not.toHaveProperty('accessToken');

    const cookies = loginResponse.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies?.some((c: string) => c.startsWith('micovi_access='))).toBe(true);
    expect(cookies?.some((c: string) => c.startsWith('micovi_refresh='))).toBe(true);

    await agent.get('/api/auth/me').expect(200);

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'academy@example.com', password: 'WrongPass' })
      .expect(401);
  });
});
