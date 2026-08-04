export class EducationLevelNotFoundException extends Error {
  constructor(id: string) {
    super(`Education level with id "${id}" was not found`);
  }
}
