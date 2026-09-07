import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DepartmentRepository } from 'src/domain/department/repositories/department.repository';
import { GetDepartmentsByCountryQuery } from '../get-departments-by-country.query';

@QueryHandler(GetDepartmentsByCountryQuery)
export class GetDepartmentsByCountryHandler implements IQueryHandler<GetDepartmentsByCountryQuery> {
  constructor(private readonly repo: DepartmentRepository) {}
  async execute(query: GetDepartmentsByCountryQuery) {
    return this.repo.findByCountryId(query.countryId);
  }
}
