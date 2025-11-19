export class SchoolNotFoundException extends Error {
  constructor(id: string) {
    super(`School ${id} was not found`);
  }
}
