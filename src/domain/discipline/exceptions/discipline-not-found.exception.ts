export class DisciplineNotFoundException extends Error {
  constructor(id: string) {
    super(`Discipline with id "${id}" was not found`);
  }
}
