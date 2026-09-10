/**
 * Query para listar disciplinas deportivas de una institución específica.
 */
export class GetDisciplinesBySchoolQuery {
  constructor(public readonly schoolId: string) {}
}
