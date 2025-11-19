export class PlanNotFoundException extends Error {
  constructor(planId: string) {
    super(`Plan with id ${planId} was not found`);
  }
}
