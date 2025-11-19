import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SubscriptionDto } from 'src/application/billing/dto/subscription.dto';
import { mapSubscriptionToDto } from 'src/application/billing/mappers/subscription.mapper';
import { SubscriptionRepository } from 'src/domain/billing/repositories/subscription.repository';
import { ListSubscriptionsQuery } from '../queries/list-subscriptions.query';

@QueryHandler(ListSubscriptionsQuery)
export class ListSubscriptionsHandler
  implements IQueryHandler<ListSubscriptionsQuery, SubscriptionDto[]>
{
  constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

  async execute(query: ListSubscriptionsQuery): Promise<SubscriptionDto[]> {
    const history = await this.subscriptionRepository.findHistoryBySchoolId(query.schoolId);
    return history.map(mapSubscriptionToDto);
  }
}
