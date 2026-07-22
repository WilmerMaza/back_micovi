export class CityNotFoundException extends Error {
  constructor(id: string) {
    super(`City with id "${id}" was not found`);
  }
}
