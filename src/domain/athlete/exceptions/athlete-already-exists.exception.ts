export class AthleteAlreadyExistsException extends Error {
  constructor(documentTypeId: string, documentNumber: string) {
    super(
      `Athlete with document type "${documentTypeId}" and number "${documentNumber}" already exists`,
    );
  }
}
