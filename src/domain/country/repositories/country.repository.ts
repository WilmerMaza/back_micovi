import { Country } from '../entities/country.entity';

export abstract class CountryRepository {
  abstract findById(id: string): Promise<Country | null>;
}
