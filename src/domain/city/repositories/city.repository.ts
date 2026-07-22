import { City } from '../entities/city.entity';

export abstract class CityRepository {
  abstract findById(id: string): Promise<City | null>;
}
