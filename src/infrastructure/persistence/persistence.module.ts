import { Module } from '@nestjs/common';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import { AuthSessionRepository } from 'src/domain/auth/repositories/auth-session.repository';
import { SchoolRepository } from 'src/domain/school/repositories/school.repository';
import { AthleteRepository } from 'src/domain/athlete/repositories/athlete.repository';
import { PlanRepository } from 'src/domain/billing/repositories/plan.repository';
import { SubscriptionRepository } from 'src/domain/billing/repositories/subscription.repository';
import { CoachRepository } from 'src/domain/coach/repositories/coach.repository';
import { PrismaUserRepository } from 'src/infrastructure/auth/persistence/repositories/user.repository.impl';
import { PrismaAuthSessionRepository } from 'src/infrastructure/auth/persistence/repositories/auth-session.repository.impl';
import { PrismaSchoolRepository } from 'src/infrastructure/school/persistence/repositories/school.repository.impl';
import { PrismaAthleteRepository } from 'src/infrastructure/athlete/persistence/repositories/athlete.repository.impl';
import { PrismaPlanRepository } from 'src/infrastructure/billing/persistence/repositories/plan.repository.impl';
import { PrismaSubscriptionRepository } from 'src/infrastructure/billing/persistence/repositories/subscription.repository.impl';
import { PrismaCoachRepository } from 'src/infrastructure/coach/persistence/repositories/coach.repository.impl';
import { PrismaService } from './prisma.service';
import { PrismaUnitOfWork } from './prisma.unit-of-work';
import { UnitOfWork } from 'src/domain/shared/unit-of-work';

@Module({
  providers: [
    PrismaService,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: AuthSessionRepository,
      useClass: PrismaAuthSessionRepository,
    },
    {
      provide: SchoolRepository,
      useClass: PrismaSchoolRepository,
    },
    {
      provide: PlanRepository,
      useClass: PrismaPlanRepository,
    },
    {
      provide: SubscriptionRepository,
      useClass: PrismaSubscriptionRepository,
    },
    {
      provide: CoachRepository,
      useClass: PrismaCoachRepository,
    },
    {
      provide: AthleteRepository,
      useClass: PrismaAthleteRepository,
    },
    PrismaUnitOfWork,
    {
      provide: UnitOfWork,
      useExisting: PrismaUnitOfWork,
    },
  ],
  exports: [
    PrismaService,
    UserRepository,
    AuthSessionRepository,
    SchoolRepository,
    PlanRepository,
    SubscriptionRepository,
    CoachRepository,
    AthleteRepository,
    UnitOfWork,
  ],
})
export class PersistenceModule {}
