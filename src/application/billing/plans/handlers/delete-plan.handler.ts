import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PlanInUseException } from 'src/domain/billing/exceptions/plan-in-use.exception';
import { PlanNotFoundException } from 'src/domain/billing/exceptions/plan-not-found.exception';
import { PlanRepository } from 'src/domain/billing/repositories/plan.repository';
import { SubscriptionRepository } from 'src/domain/billing/repositories/subscription.repository';
import { DeletePlanCommand } from '../commands/delete-plan.command';

@CommandHandler(DeletePlanCommand)
export class DeletePlanHandler implements ICommandHandler<DeletePlanCommand, void> {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async execute(command: DeletePlanCommand): Promise<void> {
    const plan = await this.planRepository.findById(command.id);
    if (!plan) {
      throw new PlanNotFoundException(command.id);
    }

    const activeSubscriptions = await this.subscriptionRepository.countActiveSubscriptionsByPlan(
      command.id,
      new Date(),
    );
    if (activeSubscriptions > 0) {
      throw new PlanInUseException(command.id);
    }

    await this.planRepository.softDelete(command.id);
  }
}
