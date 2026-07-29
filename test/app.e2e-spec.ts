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
import { PasswordHasher } from '../src/domain/auth/services/password-hasher.service';
import { CategoryRepository } from '../src/domain/school/repositories/category.repository';
import { SchoolRepository } from '../src/domain/school/repositories/school.repository';
import { SportDisciplineRepository } from '../src/domain/school/repositories/sport-discipline.repository';
import { UnitOfWork, UnitOfWorkRepositories } from '../src/domain/shared/unit-of-work';
import { User } from '../src/domain/auth/entities/user.entity';
import { UserRole } from '../src/domain/auth/entities/user-role.enum';
import { School } from '../src/domain/school/entities/school.entity';
import { schoolCharacter } from '../src/domain/school/entities/school-chacharacter.enum';
import { InstitutionType } from '../src/domain/school/entities/institution-type.enum';
import { RepresentativeDocumentType } from '../src/domain/school/entities/representative-document-type.enum';
import { Category } from '../src/domain/school/entities/category.entity';
import { SportDiscipline } from '../src/domain/school/entities/sport-discipline.entity';
import { PrismaService } from '../src/infrastructure/persistence/prisma.service';

// ---------------------------------------------------------------------------
// In-memory implementations
// ---------------------------------------------------------------------------

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
  private taxIndex = new Map<string, string>();

  async create(school: School): Promise<School> {
    this.schools.set(school.id, school);
    this.taxIndex.set(school.taxId, school.id);
    return school;
  }

  async findById(id: string): Promise<School | null> {
    return this.schools.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<School | null> {
    for (const school of this.schools.values()) {
      if (school.userId === userId) return school;
    }
    return null;
  }

  async findByTaxId(taxId: string): Promise<School | null> {
    const id = this.taxIndex.get(taxId);
    return id ? (this.schools.get(id) ?? null) : null;
  }

  async findByName(name: string): Promise<School | null> {
    for (const school of this.schools.values()) {
      if (school.name === name) return school;
    }
    return null;
  }

  snapshot(): Map<string, School> {
    return new Map(this.schools);
  }

  restore(snapshot: Map<string, School>): void {
    this.schools = new Map(snapshot);
    this.taxIndex.clear();
    for (const [id, s] of this.schools) {
      this.taxIndex.set(s.taxId, id);
    }
  }

  count(): number {
    return this.schools.size;
  }
}

class InMemoryCategoryRepository implements CategoryRepository {
  private categories: Category[] = [];

  async create(category: Category): Promise<Category> {
    this.categories.push(category);
    return category;
  }

  async findBySchoolId(schoolId: string): Promise<Category[]> {
    return this.categories.filter((c) => c.schoolId === schoolId);
  }

  snapshot(): Category[] {
    return [...this.categories];
  }

  restore(snapshot: Category[]): void {
    this.categories = [...snapshot];
  }
}

class InMemorySportDisciplineRepository implements SportDisciplineRepository {
  private disciplines = new Map<string, SportDiscipline>();
  private schoolLinks = new Map<string, Set<string>>();

  async findById(id: string): Promise<SportDiscipline | null> {
    return this.disciplines.get(id) ?? null;
  }

  async findByName(name: string): Promise<SportDiscipline | null> {
    for (const d of this.disciplines.values()) {
      if (d.name === name) return d;
    }
    return null;
  }

  async findAllByIds(ids: string[]): Promise<SportDiscipline[]> {
    return ids.map((id) => this.disciplines.get(id)).filter(Boolean) as SportDiscipline[];
  }

  async create(discipline: SportDiscipline): Promise<SportDiscipline> {
    this.disciplines.set(discipline.id, discipline);
    return discipline;
  }

  async findAll(): Promise<SportDiscipline[]> {
    return Array.from(this.disciplines.values());
  }

  async addSchoolDiscipline(schoolId: string, disciplineId: string): Promise<void> {
    if (!this.schoolLinks.has(schoolId)) {
      this.schoolLinks.set(schoolId, new Set());
    }
    this.schoolLinks.get(schoolId)!.add(disciplineId);
  }

  seed(discipline: SportDiscipline): void {
    this.disciplines.set(discipline.id, discipline);
  }

  getLinkedDisciplineIds(schoolId: string): string[] {
    return Array.from(this.schoolLinks.get(schoolId) ?? []);
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
    private readonly categoryRepository: InMemoryCategoryRepository,
    private readonly sportDisciplineRepository: InMemorySportDisciplineRepository,
  ) {}

  async execute<T>(work: (repositories: UnitOfWorkRepositories) => Promise<T>): Promise<T> {
    const userSnapshot = this.userRepository.snapshot();
    const schoolSnapshot = this.schoolRepository.snapshot();
    const categorySnapshot = this.categoryRepository.snapshot();
    try {
      return await work({
        userRepository: this.userRepository,
        schoolRepository: this.schoolRepository,
        categoryRepository: this.categoryRepository,
        sportDisciplineRepository: this.sportDisciplineRepository,
        planRepository: {
          create: jest.fn(),
          update: jest.fn(),
          findById: jest.fn(),
          findByName: jest.fn(),
          findAll: jest.fn(),
          softDelete: jest.fn(),
        } as any,
        subscriptionRepository: {
          create: jest.fn(),
          update: jest.fn(),
          findById: jest.fn(),
          findCurrentBySchoolId: jest.fn(),
          findHistoryBySchoolId: jest.fn(),
          countActiveSubscriptionsByPlan: jest.fn(),
          getUsageMetrics: jest.fn(),
        } as any,
      });
    } catch (error) {
      this.userRepository.restore(userSnapshot);
      this.schoolRepository.restore(schoolSnapshot);
      this.categoryRepository.restore(categorySnapshot);
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

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const disciplineId = '11111111-1111-4111-8111-111111111111';

const validPayload = {
  name: 'Mi Academia Deportiva',
  address: 'Cra. 45 #23-90',
  phone: '+573001112233',
  country: 'Colombia',
  state: 'Bolívar',
  city: 'Cartagena',
  character: schoolCharacter.PRIVATE,
  institutionType: InstitutionType.ACADEMY,
  taxId: '901123456-7',
  headquarters: 'Sede Principal',
  website: 'https://academia.example.com',
  representativename: 'Juan Pérez',
  representativeDocumentType: RepresentativeDocumentType.CC,
  email: 'admin@academia.com',
  password: 'SuperSecret123',
  disciplineIds: [disciplineId],
  categories: [{ name: 'Infantil', minAge: 6, maxAge: 12 }],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Auth & School flows (e2e)', () => {
  let app: INestApplication;
  let userRepository: InMemoryUserRepository;
  let schoolRepository: InMemorySchoolRepository;
  let categoryRepository: InMemoryCategoryRepository;
  let sportDisciplineRepository: InMemorySportDisciplineRepository;

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository();
    schoolRepository = new InMemorySchoolRepository();
    categoryRepository = new InMemoryCategoryRepository();
    sportDisciplineRepository = new InMemorySportDisciplineRepository();
    const unitOfWork = new InMemoryUnitOfWork(
      userRepository,
      schoolRepository,
      categoryRepository,
      sportDisciplineRepository,
    );
    const passwordHasher = new InMemoryPasswordHasher();
    const authSessionRepository = new InMemoryAuthSessionRepository();

    const mockPrismaService = {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $transaction: jest.fn((cb: any) => cb({})),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UserRepository)
      .useValue(userRepository)
      .overrideProvider(SchoolRepository)
      .useValue(schoolRepository)
      .overrideProvider(CategoryRepository)
      .useValue(categoryRepository)
      .overrideProvider(SportDisciplineRepository)
      .useValue(sportDisciplineRepository)
      .overrideProvider(AuthSessionRepository)
      .useValue(authSessionRepository)
      .overrideProvider(UnitOfWork)
      .useValue(unitOfWork)
      .overrideProvider(PasswordHasher)
      .useValue(passwordHasher)
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  beforeEach(() => {
    const football = new SportDiscipline(disciplineId, 'Fútbol', null);
    sportDisciplineRepository.seed(football);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/instituciones', () => {
    it('registers an institution with required fields only', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/instituciones')
        .send(validPayload)
        .expect(201);

      expect(response.body).toMatchObject({
        name: validPayload.name,
        address: validPayload.address,
        phone: validPayload.phone,
        taxId: validPayload.taxId,
        character: validPayload.character,
        institutionType: validPayload.institutionType,
        country: validPayload.country,
        state: validPayload.state,
        city: validPayload.city,
        headquarters: validPayload.headquarters,
        website: validPayload.website,
        representativename: validPayload.representativename,
        representativeDocumentType: validPayload.representativeDocumentType,
        categories: [{ name: 'Infantil', minAge: 6, maxAge: 12 }],
        disciplines: [{ id: disciplineId, name: 'Fútbol' }],
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.userId).toBeDefined();
      expect(userRepository.count()).toBe(1);
      expect(schoolRepository.count()).toBe(1);
    });

    it('registers an institution with multiple disciplines and categories', async () => {
      const discId2 = '22222222-2222-4222-8222-222222222222';
      const basketball = new SportDiscipline(discId2, 'Baloncesto', null);
      sportDisciplineRepository.seed(basketball);

      const response = await request(app.getHttpServer())
        .post('/api/instituciones')
        .send({
          ...validPayload,
          disciplineIds: [disciplineId, discId2],
          categories: [
            { name: 'Infantil A', minAge: 6, maxAge: 8 },
            { name: 'Infantil B', minAge: 9, maxAge: 12 },
          ],
        })
        .expect(201);

      expect(response.body.disciplines).toHaveLength(2);
      expect(response.body.categories).toHaveLength(2);
    });

    it('registers an institution with all optional fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/instituciones')
        .send({
          ...validPayload,
          logo: 'https://example.com/logo.png',
          foundationDate: '2024-01-15',
          latitude: 10.4806,
          longitude: -66.9036,
        })
        .expect(201);

      expect(response.body.logo).toBe('https://example.com/logo.png');
      expect(response.body.foundationDate).toBe('2024-01-15T00:00:00.000Z');
      expect(response.body.latitude).toBe(10.4806);
      expect(response.body.longitude).toBe(-66.9036);
    });

    it('registers an institution without optional institutionType, state, city, and representativeDocumentType', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/instituciones')
        .send({
          name: 'Academia Sin Opcionales',
          address: 'Cra. 10 #5-20',
          phone: '+573009998877',
          country: 'Colombia',
          character: schoolCharacter.PUBLIC,
          taxId: '801987654-3',
          headquarters: 'Sede Norte',
          representativename: 'María López',
          email: 'admin@academia2.com',
          password: 'SuperSecret456',
          disciplineIds: [disciplineId],
          categories: [{ name: 'Adultos', minAge: 18, maxAge: 40 }],
        })
        .expect(201);

      expect(response.body.institutionType).toBeNull();
      expect(response.body.state).toBeNull();
      expect(response.body.city).toBeNull();
      expect(response.body.representativeDocumentType).toBeNull();
      expect(response.body.name).toBe('Academia Sin Opcionales');
    });

    it('returns 409 when email is already in use', async () => {
      await request(app.getHttpServer()).post('/api/instituciones').send(validPayload).expect(201);

      await request(app.getHttpServer()).post('/api/instituciones').send(validPayload).expect(409);

      expect(userRepository.count()).toBe(1);
      expect(schoolRepository.count()).toBe(1);
    });

    it('returns 409 when taxId is already in use', async () => {
      await request(app.getHttpServer()).post('/api/instituciones').send(validPayload).expect(201);

      await request(app.getHttpServer())
        .post('/api/instituciones')
        .send({ ...validPayload, email: 'other@academia.com' })
        .expect(409);

      expect(userRepository.count()).toBe(1);
      expect(schoolRepository.count()).toBe(1);
    });

    it('returns 404 when a discipline does not exist', async () => {
      sportDisciplineRepository = new InMemorySportDisciplineRepository();
      await request(app.getHttpServer())
        .post('/api/instituciones')
        .send({ ...validPayload, disciplineIds: ['99999999-9999-4999-8999-999999999999'] })
        .expect(404);
    });

    it('returns 400 when required fields are missing', async () => {
      await request(app.getHttpServer()).post('/api/instituciones').send({}).expect(400);
    });
  });

  describe('POST /auth/login after registration', () => {
    it('allows login after a full registration and rejects wrong passwords', async () => {
      await request(app.getHttpServer()).post('/api/instituciones').send(validPayload).expect(201);

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: validPayload.email, password: validPayload.password })
        .expect(201);

      expect(loginResponse.body).toMatchObject({
        email: validPayload.email,
        role: UserRole.SCHOOL,
      });
      expect(loginResponse.body.id).toBeDefined();
      expect(loginResponse.body.schoolId).toBeDefined();

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: validPayload.email, password: 'WrongPassword' })
        .expect(401);
    });
  });
});
