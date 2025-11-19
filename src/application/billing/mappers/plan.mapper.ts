import { PlanDto } from '../dto/plan.dto';
import { Plan } from 'src/domain/billing/entities/plan.entity';

export const mapPlanToDto = (plan: Plan): PlanDto => ({
  id: plan.id,
  name: plan.name,
  description: plan.description,
  price: plan.price,
  billingPeriodMonths: plan.billingPeriodMonths,
  maxCoaches: plan.maxCoaches,
  maxAthletes: plan.maxAthletes,
  isActive: plan.isActive,
  createdAt: plan.createdAt,
  updatedAt: plan.updatedAt,
});
