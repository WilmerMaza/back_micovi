/**
 * Puerto de repositorio para catálogo de países.
 */
import { Country } from '../entities/country.entity';

export abstract class CountryRepository {
  abstract findById(id: string): Promise<Country | null>;
  abstract findAll(): Promise<Country[]>;
}
