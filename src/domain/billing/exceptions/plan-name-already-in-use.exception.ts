export class PlanNameAlreadyInUseException extends Error {
  constructor(name: string) {
    super(`Plan name "${name}" is already in use`);
  }
}
