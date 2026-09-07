/**
 * Excepción de dominio para cuando no se encuentra un atleta.
 */
export class AthleteNotFoundException extends Error {
  constructor(id: string) {
    super(`Athlete with id "${id}" not found`);
    this.name = 'AthleteNotFoundException';
  }
}
