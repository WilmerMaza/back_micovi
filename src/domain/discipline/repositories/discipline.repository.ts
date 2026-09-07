/**
 * Puerto de repositorio para catálogo de disciplinas deportivas.
 */
import { Discipline } from '../entities/discipline.entity';

export abstract class DisciplineRepository {
  abstract findById(id: string): Promise<Discipline | null>;
  abstract findBySchoolId(schoolId: string): Promise<Discipline[]>;
}
