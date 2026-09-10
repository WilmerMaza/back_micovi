import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CityRepository } from 'src/domain/city/repositories/city.repository';
import { GetCitiesByDepartmentQuery } from '../get-cities-by-department.query';

@QueryHandler(GetCitiesByDepartmentQuery)
export class GetCitiesByDepartmentHandler implements IQueryHandler<GetCitiesByDepartmentQuery> {
  constructor(private readonly repo: CityRepository) {}
  async execute(query: GetCitiesByDepartmentQuery) {
    return this.repo.findByDepartmentId(query.departmentId);
  }
}
