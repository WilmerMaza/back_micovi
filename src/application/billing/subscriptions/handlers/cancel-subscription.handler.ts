import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubscriptionDto } from 'src/application/billing/dto/subscription.dto';
import { mapSubscriptionToDto } from 'src/application/billing/mappers/subscription.mapper';
import { SchoolSubscription } from 'src/domain/billing/entities/school-subscription.entity';
import { SubscriptionStatus } from 'src/domain/billing/entities/subscription-status.enum';
import { SubscriptionInvalidStateException } from 'src/domain/billing/exceptions/subscription-invalid-state.exception';
import { SubscriptionNotFoundException } from 'src/domain/billing/exceptions/subscription-not-found.exception';
import { SubscriptionRepository } from 'src/domain/billing/repositories/subscription.repository';
import { CancelSubscriptionCommand } from '../commands/cancel-subscription.command';

@CommandHandler(CancelSubscriptionCommand)
export class CancelSubscriptionHandler
  implements ICommandHandler<CancelSubscriptionCommand, SubscriptionDto>
{
  constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

  async execute(command: CancelSubscriptionCommand): Promise<SubscriptionDto> {
    const subscription = await this.subscriptionRepository.findById(command.subscriptionId);
    if (!subscription) {
      throw new SubscriptionNotFoundException(command.subscriptionId);
    }

    if (subscription.schoolId !== command.schoolId) {
      throw new SubscriptionInvalidStateException(
        'Subscription does not belong to the requested school',
      );
    }

    if (
      subscription.status === SubscriptionStatus.CANCELED ||
      subscription.status === SubscriptionStatus.EXPIRED
    ) {
      throw new SubscriptionInvalidStateException('Subscription is no longer active');
    }

    const effectiveDate = command.effectiveDate ?? new Date();
    if (effectiveDate < subscription.startDate) {
      throw new SubscriptionInvalidStateException(
        'Effective date cannot be before subscription start date',
      );
    }

    const targetEndDate =
      effectiveDate > subscription.endDate ? subscription.endDate : effectiveDate;
    const status =
      targetEndDate >= subscription.endDate
        ? SubscriptionStatus.EXPIRED
        : SubscriptionStatus.CANCELED;

    const updated = new SchoolSubscription(
      subscription.id,
      subscription.schoolId,
      subscription.planId,
      subscription.startDate,
      targetEndDate,
      status,
      subscription.createdAt,
      new Date(),
      new Date(),
      subscription.plan,
    );
    const persisted = await this.subscriptionRepository.update(updated);
    return mapSubscriptionToDto(persisted);
  }
}
