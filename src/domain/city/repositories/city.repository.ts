/**
 * Puerto de repositorio para catálogo de ciudades.
 */
import { City } from '../entities/city.entity';

export abstract class CityRepository {
  abstract findById(id: string): Promise<City | null>;
  abstract findByDepartmentId(departmentId: string): Promise<City[]>;
}
