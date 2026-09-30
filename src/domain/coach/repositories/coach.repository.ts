import { Coach } from '../entities/coach.entity';

export abstract class CoachRepository {
  abstract findById(id: string): Promise<Coach | null>;
  abstract create(coach: Coach): Promise<Coach>;
}
