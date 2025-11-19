export class UpdatePlanCommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly billingPeriodMonths: number,
    public readonly maxCoaches?: number,
    public readonly maxAthletes?: number,
    public readonly isActive?: boolean,
  ) {}
}
