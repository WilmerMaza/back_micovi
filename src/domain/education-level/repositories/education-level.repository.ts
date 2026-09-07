/**
 * Puerto de repositorio para catálogo de niveles educativos.
 */
import { EducationLevel } from '../entities/education-level.entity';

export abstract class EducationLevelRepository {
  abstract findById(id: string): Promise<EducationLevel | null>;
  abstract findAll(): Promise<EducationLevel[]>;
}
