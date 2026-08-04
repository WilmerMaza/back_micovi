export class CategoryNotFoundException extends Error {
  constructor(id: string) {
    super(`Category with id "${id}" was not found`);
  }
}
