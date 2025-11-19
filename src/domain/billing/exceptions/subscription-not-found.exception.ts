export class SubscriptionNotFoundException extends Error {
  constructor(subscriptionId: string) {
    super(`Subscription ${subscriptionId} was not found`);
  }
}
