/**
 * Puerto de repositorio para catálogo de departamentos.
 */
import { Department } from '../entities/department.entity';

export abstract class DepartmentRepository {
  abstract findById(id: string): Promise<Department | null>;
  abstract findByCountryId(countryId: string): Promise<Department[]>;
}
