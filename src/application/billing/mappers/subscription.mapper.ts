import { SubscriptionDto } from '../dto/subscription.dto';
import { SchoolSubscription } from 'src/domain/billing/entities/school-subscription.entity';

export const mapSubscriptionToDto = (subscription: SchoolSubscription): SubscriptionDto => ({
  id: subscription.id,
  schoolId: subscription.schoolId,
  planId: subscription.planId,
  plan: {
    id: subscription.plan?.id ?? subscription.planId,
    name: subscription.plan?.name ?? '',
    description: subscription.plan?.description ?? '',
    price: subscription.plan?.price ?? 0,
  },
  startDate: subscription.startDate,
  endDate: subscription.endDate,
  status: subscription.status,
  canceledAt: subscription.canceledAt ?? null,
});
