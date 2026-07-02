import { Module } from '@nestjs/common';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import { AuthSessionRepository } from 'src/domain/auth/repositories/auth-session.repository';
import { SchoolRepository } from 'src/domain/school/repositories/school.repository';
import { PlanRepository } from 'src/domain/billing/repositories/plan.repository';
import { SubscriptionRepository } from 'src/domain/billing/repositories/subscription.repository';
import { PrismaUserRepository } from 'src/infrastructure/auth/persistence/repositories/user.repository.impl';
import { PrismaAuthSessionRepository } from 'src/infrastructure/auth/persistence/repositories/auth-session.repository.impl';
import { PrismaSchoolRepository } from 'src/infrastructure/school/persistence/repositories/school.repository.impl';
import { PrismaPlanRepository } from 'src/infrastructure/billing/persistence/repositories/plan.repository.impl';
import { PrismaSubscriptionRepository } from 'src/infrastructure/billing/persistence/repositories/subscription.repository.impl';
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
    UnitOfWork,
  ],
})
export class PersistenceModule {}
