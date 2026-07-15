export class TaxIdAlreadyInUseException extends Error {
  constructor(taxId: string) {
    super(`Tax ID ${taxId} is already in use`);
  }
}
