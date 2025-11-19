export class AssignPlanToSchoolCommand {
  constructor(
    public readonly schoolId: string,
    public readonly planId: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
  ) {}
}
