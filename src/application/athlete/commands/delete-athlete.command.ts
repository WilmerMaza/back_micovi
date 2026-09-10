/**
 * Command para eliminar (soft delete) un atleta.
 */
export class DeleteAthleteCommand {
  constructor(
    public readonly schoolId: string,
    public readonly athleteId: string,
  ) {}
}
