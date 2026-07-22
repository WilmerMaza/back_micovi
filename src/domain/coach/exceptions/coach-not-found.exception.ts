export class CoachNotFoundException extends Error {
  constructor(id: string) {
    super(`Coach with id "${id}" was not found`);
  }
}
