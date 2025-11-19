import { UserRepository } from '../auth/repositories/user.repository';
import { PlanRepository } from '../billing/repositories/plan.repository';
import { SubscriptionRepository } from '../billing/repositories/subscription.repository';
import { SchoolRepository } from '../school/repositories/school.repository';

export interface UnitOfWorkRepositories {
  userRepository: UserRepository;
  schoolRepository: SchoolRepository;
  planRepository: PlanRepository;
  subscriptionRepository: SubscriptionRepository;
}

export abstract class UnitOfWork {
  abstract execute<T>(work: (repositories: UnitOfWorkRepositories) => Promise<T>): Promise<T>;
}
