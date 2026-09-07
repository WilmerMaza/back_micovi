/**
 * Handler que ejecuta la query de listado de atletas.
 * Delega al repositorio la búsqueda con filtros y paginación.
 */
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AthleteRepository } from 'src/domain/athlete/repositories/athlete.repository';
import { ListAthletesQuery } from '../list-athletes.query';

@QueryHandler(ListAthletesQuery)
export class ListAthletesHandler implements IQueryHandler<ListAthletesQuery> {
  constructor(private readonly athleteRepository: AthleteRepository) {}

  async execute(query: ListAthletesQuery) {
    return this.athleteRepository.findMany({
      schoolId: query.schoolId,
      search: query.search,
      categoryId: query.categoryId,
      disciplineId: query.disciplineId,
      genderId: query.genderId,
      page: query.page,
      limit: query.limit,
    });
  }
}
