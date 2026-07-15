import { SportDiscipline } from '../entities/sport-discipline.entity';

export abstract class SportDisciplineRepository {
  abstract findById(id: string): Promise<SportDiscipline | null>;
  abstract findByName(name: string): Promise<SportDiscipline | null>;
  abstract findAllByIds(ids: string[]): Promise<SportDiscipline[]>;
  abstract create(discipline: SportDiscipline): Promise<SportDiscipline>;
  abstract findAll(): Promise<SportDiscipline[]>;
  abstract addSchoolDiscipline(schoolId: string, disciplineId: string): Promise<void>;
}
