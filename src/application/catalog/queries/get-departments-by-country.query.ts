/**
 * Query para listar departamentos de un país específico.
 */
export class GetDepartmentsByCountryQuery {
  constructor(public readonly countryId: string) {}
}
