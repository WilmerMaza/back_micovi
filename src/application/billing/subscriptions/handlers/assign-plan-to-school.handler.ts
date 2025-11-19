import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { SubscriptionDto } from 'src/application/billing/dto/subscription.dto';
import { mapSubscriptionToDto } from 'src/application/billing/mappers/subscription.mapper';
import { addMonths } from 'src/application/billing/utils/date.utils';
import { SchoolSubscription } from 'src/domain/billing/entities/school-subscription.entity';
import { SubscriptionStatus } from 'src/domain/billing/entities/subscription-status.enum';
import { PlanNotFoundException } from 'src/domain/billing/exceptions/plan-not-found.exception';
import { ActiveSubscriptionOverlapException } from 'src/domain/billing/exceptions/active-subscription-overlap.exception';
import { SubscriptionRepository } from 'src/domain/billing/repositories/subscription.repository';
import { SchoolNotFoundException } from 'src/domain/school/exceptions/school-not-found.exception';
import { UnitOfWork } from 'src/domain/shared/unit-of-work';
import { AssignPlanToSchoolCommand } from '../commands/assign-plan-to-school.command';
import { SubscriptionInvalidStateException } from 'src/domain/billing/exceptions/subscription-invalid-state.exception';

@CommandHandler(AssignPlanToSchoolCommand)
export class AssignPlanToSchoolHandler
  implements ICommandHandler<AssignPlanToSchoolCommand, SubscriptionDto>
{
  constructor(private readonly unitOfWork: UnitOfWork) {}

  async execute(command: AssignPlanToSchoolCommand): Promise<SubscriptionDto> {
    return this.unitOfWork.execute(
      async ({ schoolRepository, planRepository, subscriptionRepository }) => {
        const school = await schoolRepository.findById(command.schoolId);
        if (!school) {
          throw new SchoolNotFoundException(command.schoolId);
        }

        const plan = await planRepository.findById(command.planId);
        if (!plan || !plan.isActive) {
          throw new PlanNotFoundException(command.planId);
        }

        const startDate = command.startDate ?? new Date();
        const computedEndDate = command.endDate ?? addMonths(startDate, plan.billingPeriodMonths);
        if (computedEndDate <= startDate) {
          throw new SubscriptionInvalidStateException('End date must be after start date');
        }

        await this.ensureNoScheduledOverlap(subscriptionRepository, command.schoolId, startDate);
        await this.shortenActiveSubscription(subscriptionRepository, command.schoolId, startDate);

        const status =
          startDate > new Date() ? SubscriptionStatus.SCHEDULED : SubscriptionStatus.ACTIVE;

        const subscription = new SchoolSubscription(
          randomUUID(),
          school.id,
          plan.id,
          startDate,
          computedEndDate,
          status,
          new Date(),
          new Date(),
          null,
          plan,
        );

        const created = await subscriptionRepository.create(subscription);
        return mapSubscriptionToDto(created);
      },
    );
  }

  private async ensureNoScheduledOverlap(
    subscriptionRepository: SubscriptionRepository,
    schoolId: string,
    newStartDate: Date,
  ): Promise<void> {
    const history = await subscriptionRepository.findHistoryBySchoolId(schoolId);
    const overlapping = history.find(
      (sub) =>
        sub.status === SubscriptionStatus.SCHEDULED &&
        sub.startDate.getTime() >= newStartDate.getTime(),
    );
    if (overlapping) {
      throw new ActiveSubscriptionOverlapException();
    }
  }

  private async shortenActiveSubscription(
    subscriptionRepository: SubscriptionRepository,
    schoolId: string,
    newStartDate: Date,
  ): Promise<void> {
    const current = await subscriptionRepository.findCurrentBySchoolId(schoolId, newStartDate);
    if (!current) {
      return;
    }

    if (current.startDate >= newStartDate) {
      return;
    }

    const adjustedEnd = new Date(newStartDate.getTime() - 1000);
    const updated = new SchoolSubscription(
      current.id,
      current.schoolId,
      current.planId,
      current.startDate,
      adjustedEnd > current.startDate ? adjustedEnd : current.startDate,
      current.status,
      current.createdAt,
      new Date(),
      current.canceledAt,
      current.plan,
    );
    await subscriptionRepository.update(updated);
  }
}
