export class PlanInUseException extends Error {
  constructor(planId: string) {
    super(`Plan ${planId} cannot be deleted because it has active subscriptions`);
  }
}
