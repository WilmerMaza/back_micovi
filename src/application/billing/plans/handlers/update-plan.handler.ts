import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PlanDto } from 'src/application/billing/dto/plan.dto';
import { mapPlanToDto } from 'src/application/billing/mappers/plan.mapper';
import { Plan } from 'src/domain/billing/entities/plan.entity';
import { PlanNotFoundException } from 'src/domain/billing/exceptions/plan-not-found.exception';
import { PlanRepository } from 'src/domain/billing/repositories/plan.repository';
import { UpdatePlanCommand } from '../commands/update-plan.command';
import { PlanNameAlreadyInUseException } from 'src/domain/billing/exceptions/plan-name-already-in-use.exception';

@CommandHandler(UpdatePlanCommand)
export class UpdatePlanHandler implements ICommandHandler<UpdatePlanCommand, PlanDto> {
  constructor(private readonly planRepository: PlanRepository) {}

  async execute(command: UpdatePlanCommand): Promise<PlanDto> {
    const existing = await this.planRepository.findById(command.id);
    if (!existing) {
      throw new PlanNotFoundException(command.id);
    }

    if (existing.name !== command.name) {
      const duplicated = await this.planRepository.findByName(command.name);
      if (duplicated && duplicated.id !== existing.id) {
        throw new PlanNameAlreadyInUseException(command.name);
      }
    }

    const updatedPlan = new Plan(
      existing.id,
      command.name,
      command.description,
      command.price,
      command.billingPeriodMonths,
      command.maxCoaches ?? null,
      command.maxAthletes ?? null,
      command.isActive ?? existing.isActive,
      existing.createdAt,
      new Date(),
    );

    const persisted = await this.planRepository.update(updatedPlan);
    return mapPlanToDto(persisted);
  }
}
