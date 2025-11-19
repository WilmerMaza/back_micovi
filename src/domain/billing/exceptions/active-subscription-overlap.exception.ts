export class ActiveSubscriptionOverlapException extends Error {
  constructor() {
    super('The school already has an active subscription for the requested period');
  }
}
