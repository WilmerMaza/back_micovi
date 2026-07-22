import { Department } from '../entities/department.entity';

export abstract class DepartmentRepository {
  abstract findById(id: string): Promise<Department | null>;
}
