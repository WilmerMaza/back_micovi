/**
 * Query para listar categorías deportivas de una institución específica.
 */
export class GetCategoriesBySchoolQuery {
  constructor(public readonly schoolId: string) {}
}
