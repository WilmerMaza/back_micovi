export class NameAlreadyInUseException extends Error {
  constructor(name: string) {
    super(`The institution name "${name}" is already in use`);
  }
}
