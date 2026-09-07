/**
 * Handler que ejecuta la query de obtención de un atleta por ID.
 * Verifica que el atleta pertenezca a la institución.
 */
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AthleteNotFoundException } from 'src/domain/athlete/exceptions/athlete-not-found.exception';
import { AthleteRepository } from 'src/domain/athlete/repositories/athlete.repository';
import { GetAthleteQuery } from '../get-athlete.query';
import { mapAthleteToDto } from '../../mappers/athlete.mapper';

@QueryHandler(GetAthleteQuery)
export class GetAthleteHandler implements IQueryHandler<GetAthleteQuery> {
  constructor(private readonly athleteRepository: AthleteRepository) {}

  async execute(query: GetAthleteQuery) {
    const athlete = await this.athleteRepository.findBySchoolAndId(query.schoolId, query.athleteId);
    if (!athlete) {
      throw new AthleteNotFoundException(query.athleteId);
    }
    return mapAthleteToDto(athlete);
  }
}
