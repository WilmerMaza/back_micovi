export class EmailAlreadyInUseException extends Error {
  constructor(email: string) {
    super(`Email ${email} already in use`);
  }
}
