import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PlanStatusDto } from 'src/application/billing/dto/plan-status.dto';
import { SubscriptionRepository } from 'src/domain/billing/repositories/subscription.repository';
import { GetPlanStatusQuery } from '../queries/get-plan-status.query';

@QueryHandler(GetPlanStatusQuery)
export class GetPlanStatusHandler implements IQueryHandler<GetPlanStatusQuery, PlanStatusDto> {
  constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

  async execute(query: GetPlanStatusQuery): Promise<PlanStatusDto> {
    const [subscription, usage] = await Promise.all([
      this.subscriptionRepository.findCurrentBySchoolId(query.schoolId, new Date()),
      this.subscriptionRepository.getUsageMetrics(query.schoolId),
    ]);

    const maxCoaches = subscription?.plan?.maxCoaches ?? null;
    const maxAthletes = subscription?.plan?.maxAthletes ?? null;
    const withinCoaches = maxCoaches == null || usage.coaches <= maxCoaches;
    const withinAthletes = maxAthletes == null || usage.athletes <= maxAthletes;

    return {
      schoolId: query.schoolId,
      active: Boolean(subscription),
      planId: subscription?.planId ?? null,
      planName: subscription?.plan?.name ?? null,
      expiresAt: subscription?.endDate ?? null,
      maxCoaches,
      maxAthletes,
      currentCoaches: usage.coaches,
      currentAthletes: usage.athletes,
      withinLimits: Boolean(subscription) && withinCoaches && withinAthletes,
    };
  }
}
