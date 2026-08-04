import { Category } from '../entities/category.entity';

export abstract class CategoryRepository {
  abstract create(category: Category): Promise<Category>;
  abstract findBySchoolId(schoolId: string): Promise<Category[]>;
}
