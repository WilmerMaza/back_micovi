import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DisciplineRepository } from 'src/domain/discipline/repositories/discipline.repository';
import { GetDisciplinesBySchoolQuery } from '../get-disciplines-by-school.query';

@QueryHandler(GetDisciplinesBySchoolQuery)
export class GetDisciplinesBySchoolHandler implements IQueryHandler<GetDisciplinesBySchoolQuery> {
  constructor(private readonly repo: DisciplineRepository) {}
  async execute(query: GetDisciplinesBySchoolQuery) {
    return this.repo.findBySchoolId(query.schoolId);
  }
}
