export class DepartmentNotFoundException extends Error {
  constructor(id: string) {
    super(`Department with id "${id}" was not found`);
  }
}
