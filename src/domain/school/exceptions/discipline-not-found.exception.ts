export class DisciplineNotFoundException extends Error {
  constructor(id: string) {
    super(`Sport discipline ${id} was not found`);
  }
}
