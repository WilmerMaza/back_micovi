import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PlanDto } from 'src/application/billing/dto/plan.dto';
import { mapPlanToDto } from 'src/application/billing/mappers/plan.mapper';
import { PlanRepository } from 'src/domain/billing/repositories/plan.repository';
import { ListPlansQuery } from '../queries/list-plans.query';

@QueryHandler(ListPlansQuery)
export class ListPlansHandler implements IQueryHandler<ListPlansQuery, PlanDto[]> {
  constructor(private readonly planRepository: PlanRepository) {}

  async execute(): Promise<PlanDto[]> {
    const plans = await this.planRepository.findAll();
    return plans.map(mapPlanToDto);
  }
}
