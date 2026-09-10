/**
 * Query para obtener un atleta específico por ID dentro de una institución.
 */
export class GetAthleteQuery {
  constructor(
    public readonly schoolId: string,
    public readonly athleteId: string,
  ) {}
}
