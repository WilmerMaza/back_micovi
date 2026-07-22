import { Discipline } from '../entities/discipline.entity';

export abstract class DisciplineRepository {
  abstract findById(id: string): Promise<Discipline | null>;
}
