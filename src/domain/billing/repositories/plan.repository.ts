import { Plan } from '../entities/plan.entity';

export abstract class PlanRepository {
  abstract create(plan: Plan): Promise<Plan>;
  abstract update(plan: Plan): Promise<Plan>;
  abstract findById(id: string): Promise<Plan | null>;
  abstract findByName(name: string): Promise<Plan | null>;
  abstract findAll(): Promise<Plan[]>;
  abstract softDelete(id: string): Promise<void>;
}
