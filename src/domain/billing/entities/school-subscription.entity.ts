import { Plan } from './plan.entity';
import { SubscriptionStatus } from './subscription-status.enum';

export class SchoolSubscription {
  constructor(
    public readonly id: string,
    public readonly schoolId: string,
    public readonly planId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly status: SubscriptionStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly canceledAt: Date | null,
    public readonly plan?: Plan,
  ) {}

  get isActive(): boolean {
    return this.status === SubscriptionStatus.ACTIVE;
  }
}
