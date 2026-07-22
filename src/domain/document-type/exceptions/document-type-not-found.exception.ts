export class DocumentTypeNotFoundException extends Error {
  constructor(id: string) {
    super(`Document type with id "${id}" was not found`);
  }
}
