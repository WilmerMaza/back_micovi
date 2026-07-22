export class GenderNotFoundException extends Error {
  constructor(id: string) {
    super(`Gender with id "${id}" was not found`);
  }
}
