import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UnitOfWork, UnitOfWorkRepositories } from 'src/domain/shared/unit-of-work';
import { PrismaUserRepository } from 'src/infrastructure/auth/persistence/repositories/user.repository.impl';
import { PrismaPlanRepository } from 'src/infrastructure/billing/persistence/repositories/plan.repository.impl';
import { PrismaSubscriptionRepository } from 'src/infrastructure/billing/persistence/repositories/subscription.repository.impl';
import { PrismaSchoolRepository } from 'src/infrastructure/school/persistence/repositories/school.repository.impl';

@Injectable()
export class PrismaUnitOfWork implements UnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  async execute<T>(work: (repositories: UnitOfWorkRepositories) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const userRepository = new PrismaUserRepository(tx);
      const schoolRepository = new PrismaSchoolRepository(tx);
      const planRepository = new PrismaPlanRepository(tx);
      const subscriptionRepository = new PrismaSubscriptionRepository(tx);
      return work({ userRepository, schoolRepository, planRepository, subscriptionRepository });
    });
  }
}
