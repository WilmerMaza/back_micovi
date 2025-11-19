import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SubscriptionDto } from 'src/application/billing/dto/subscription.dto';
import { mapSubscriptionToDto } from 'src/application/billing/mappers/subscription.mapper';
import { SubscriptionRepository } from 'src/domain/billing/repositories/subscription.repository';
import { GetCurrentSubscriptionQuery } from '../queries/get-current-subscription.query';

@QueryHandler(GetCurrentSubscriptionQuery)
export class GetCurrentSubscriptionHandler
  implements IQueryHandler<GetCurrentSubscriptionQuery, SubscriptionDto | null>
{
  constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

  async execute(query: GetCurrentSubscriptionQuery): Promise<SubscriptionDto | null> {
    const subscription = await this.subscriptionRepository.findCurrentBySchoolId(
      query.schoolId,
      new Date(),
    );
    return subscription ? mapSubscriptionToDto(subscription) : null;
  }
}
