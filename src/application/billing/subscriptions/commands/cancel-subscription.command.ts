export class CancelSubscriptionCommand {
  constructor(
    public readonly schoolId: string,
    public readonly subscriptionId: string,
    public readonly effectiveDate?: Date,
  ) {}
}
