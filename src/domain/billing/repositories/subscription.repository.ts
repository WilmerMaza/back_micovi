import { SchoolSubscription } from '../entities/school-subscription.entity';

export interface UsageMetrics {
  coaches: number;
  athletes: number;
}

export abstract class SubscriptionRepository {
  abstract create(subscription: SchoolSubscription): Promise<SchoolSubscription>;
  abstract update(subscription: SchoolSubscription): Promise<SchoolSubscription>;
  abstract findById(id: string): Promise<SchoolSubscription | null>;
  abstract findCurrentBySchoolId(
    schoolId: string,
    referenceDate: Date,
  ): Promise<SchoolSubscription | null>;
  abstract findHistoryBySchoolId(schoolId: string): Promise<SchoolSubscription[]>;
  abstract countActiveSubscriptionsByPlan(planId: string, referenceDate: Date): Promise<number>;
  abstract getUsageMetrics(schoolId: string): Promise<UsageMetrics>;
}
