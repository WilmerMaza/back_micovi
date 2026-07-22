import { Category } from '../entities/category.entity';

export abstract class CategoryRepository {
  abstract findById(id: string): Promise<Category | null>;
}
