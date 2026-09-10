import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CountryRepository } from 'src/domain/country/repositories/country.repository';
import { ListCountriesQuery } from '../list-countries.query';

@QueryHandler(ListCountriesQuery)
export class ListCountriesHandler implements IQueryHandler<ListCountriesQuery> {
  constructor(private readonly repo: CountryRepository) {}
  async execute() {
    return this.repo.findAll();
  }
}
