/**
 * Query para listar atletas de una institución con filtros, búsqueda y paginación.
 */
export class ListAthletesQuery {
  constructor(
    public readonly schoolId: string,
    public readonly search?: string,
    public readonly categoryId?: string,
    public readonly disciplineId?: string,
    public readonly genderId?: string,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
