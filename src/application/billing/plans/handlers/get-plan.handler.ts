import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PlanDto } from 'src/application/billing/dto/plan.dto';
import { mapPlanToDto } from 'src/application/billing/mappers/plan.mapper';
import { PlanNotFoundException } from 'src/domain/billing/exceptions/plan-not-found.exception';
import { PlanRepository } from 'src/domain/billing/repositories/plan.repository';
import { GetPlanQuery } from '../queries/get-plan.query';

@QueryHandler(GetPlanQuery)
export class GetPlanHandler implements IQueryHandler<GetPlanQuery, PlanDto> {
  constructor(private readonly planRepository: PlanRepository) {}

  async execute(query: GetPlanQuery): Promise<PlanDto> {
    const plan = await this.planRepository.findById(query.id);
    if (!plan) {
      throw new PlanNotFoundException(query.id);
    }
    return mapPlanToDto(plan);
  }
}
