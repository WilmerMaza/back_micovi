/**
 * Query para listar ciudades de un departamento específico.
 */
export class GetCitiesByDepartmentQuery {
  constructor(public readonly departmentId: string) {}
}
