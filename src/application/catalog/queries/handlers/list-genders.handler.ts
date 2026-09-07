import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GenderRepository } from 'src/domain/gender/repositories/gender.repository';
import { ListGendersQuery } from '../list-genders.query';

@QueryHandler(ListGendersQuery)
export class ListGendersHandler implements IQueryHandler<ListGendersQuery> {
  constructor(private readonly repo: GenderRepository) {}
  async execute() {
    return this.repo.findAll();
  }
}
