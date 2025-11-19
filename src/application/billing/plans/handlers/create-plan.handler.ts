import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { PlanDto } from 'src/application/billing/dto/plan.dto';
import { mapPlanToDto } from 'src/application/billing/mappers/plan.mapper';
import { Plan } from 'src/domain/billing/entities/plan.entity';
import { PlanNameAlreadyInUseException } from 'src/domain/billing/exceptions/plan-name-already-in-use.exception';
import { PlanRepository } from 'src/domain/billing/repositories/plan.repository';
import { CreatePlanCommand } from '../commands/create-plan.command';

@CommandHandler(CreatePlanCommand)
export class CreatePlanHandler implements ICommandHandler<CreatePlanCommand, PlanDto> {
  constructor(private readonly planRepository: PlanRepository) {}

  async execute(command: CreatePlanCommand): Promise<PlanDto> {
    const existingPlan = await this.planRepository.findByName(command.name);
    if (existingPlan) {
      throw new PlanNameAlreadyInUseException(command.name);
    }

    const now = new Date();
    const plan = new Plan(
      randomUUID(),
      command.name,
      command.description,
      command.price,
      command.billingPeriodMonths,
      command.maxCoaches ?? null,
      command.maxAthletes ?? null,
      true,
      now,
      now,
    );
    const created = await this.planRepository.create(plan);
    return mapPlanToDto(created);
  }
}
