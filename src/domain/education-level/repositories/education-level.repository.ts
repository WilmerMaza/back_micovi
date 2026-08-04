import { EducationLevel } from '../entities/education-level.entity';

export abstract class EducationLevelRepository {
  abstract findById(id: string): Promise<EducationLevel | null>;
}
