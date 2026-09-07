import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CategoryRepository } from 'src/domain/category/repositories/category.repository';
import { GetCategoriesBySchoolQuery } from '../get-categories-by-school.query';

@QueryHandler(GetCategoriesBySchoolQuery)
export class GetCategoriesBySchoolHandler implements IQueryHandler<GetCategoriesBySchoolQuery> {
  constructor(private readonly repo: CategoryRepository) {}
  async execute(query: GetCategoriesBySchoolQuery) {
    return this.repo.findBySchoolId(query.schoolId);
  }
}
