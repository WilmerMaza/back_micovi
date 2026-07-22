import { Athlete } from '../entities/athlete.entity';

export abstract class AthleteRepository {
  abstract create(athlete: Athlete): Promise<Athlete>;

  // TODO: [DB] Implement when documentTypeId + documentNumber columns exist
  abstract findByDocument(documentTypeId: string, documentNumber: string): Promise<Athlete | null>;

  // TODO: [DB] Implement when email column exists
  abstract findByEmail(email: string): Promise<Athlete | null>;
}
