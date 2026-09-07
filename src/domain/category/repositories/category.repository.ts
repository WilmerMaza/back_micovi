/**
 * Puerto de repositorio para catálogo de categorías deportivas.
 */
import { Category } from '../entities/category.entity';

export abstract class CategoryRepository {
  abstract findById(id: string): Promise<Category | null>;
  abstract findBySchoolId(schoolId: string): Promise<Category[]>;
}
