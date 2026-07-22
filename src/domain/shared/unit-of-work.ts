import { UserRepository } from '../auth/repositories/user.repository';
import { AthleteRepository } from '../athlete/repositories/athlete.repository';
import { PlanRepository } from '../billing/repositories/plan.repository';
import { SubscriptionRepository } from '../billing/repositories/subscription.repository';
import { SchoolRepository } from '../school/repositories/school.repository';
import { CoachRepository } from '../coach/repositories/coach.repository';

export interface UnitOfWorkRepositories {
  userRepository: UserRepository;
  schoolRepository: SchoolRepository;
  planRepository: PlanRepository;
  subscriptionRepository: SubscriptionRepository;
  coachRepository: CoachRepository;
  athleteRepository: AthleteRepository;
}

export abstract class UnitOfWork {
  abstract execute<T>(work: (repositories: UnitOfWorkRepositories) => Promise<T>): Promise<T>;
}
