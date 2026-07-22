export class CountryNotFoundException extends Error {
  constructor(id: string) {
    super(`Country with id "${id}" was not found`);
  }
}
