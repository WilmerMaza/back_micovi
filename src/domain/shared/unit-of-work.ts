import { UserRepository } from '../auth/repositories/user.repository';
import { PlanRepository } from '../billing/repositories/plan.repository';
import { SubscriptionRepository } from '../billing/repositories/subscription.repository';
import { SchoolRepository } from '../school/repositories/school.repository';
import { CategoryRepository } from '../school/repositories/category.repository';
import { SportDisciplineRepository } from '../school/repositories/sport-discipline.repository';

export interface UnitOfWorkRepositories {
  userRepository: UserRepository;
  schoolRepository: SchoolRepository;
  planRepository: PlanRepository;
  subscriptionRepository: SubscriptionRepository;
  categoryRepository: CategoryRepository;
  sportDisciplineRepository: SportDisciplineRepository;
}

export abstract class UnitOfWork {
  abstract execute<T>(work: (repositories: UnitOfWorkRepositories) => Promise<T>): Promise<T>;
}
