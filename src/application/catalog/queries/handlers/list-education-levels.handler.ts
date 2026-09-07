import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { EducationLevelRepository } from 'src/domain/education-level/repositories/education-level.repository';
import { ListEducationLevelsQuery } from '../list-education-levels.query';

@QueryHandler(ListEducationLevelsQuery)
export class ListEducationLevelsHandler implements IQueryHandler<ListEducationLevelsQuery> {
  constructor(private readonly repo: EducationLevelRepository) {}
  async execute() {
    return this.repo.findAll();
  }
}
