import { Athlete } from '../entities/athlete.entity';

export abstract class AthleteRepository {
  abstract create(athlete: Athlete): Promise<Athlete>;
  abstract findByDocument(documentTypeId: string, documentNumber: string): Promise<Athlete | null>;
  abstract findByEmail(email: string): Promise<Athlete | null>;
  abstract addDiscipline(athleteId: string, disciplineId: string): Promise<void>;
  abstract addInstitution(athleteId: string, schoolId: string): Promise<void>;
}
