/**
 * Puerto de repositorio para la entidad Athlete.
 *
 * Define las operaciones de persistencia disponibles para los atletas.
 * Las implementaciones concretas están en la capa de infraestructura (Prisma).
 */
import { Athlete } from '../entities/athlete.entity';

export interface AthleteListParams {
  schoolId: string;
  search?: string;
  categoryId?: string;
  disciplineId?: string;
  genderId?: string;
  page?: number;
  limit?: number;
}

export interface AthleteListResult {
  data: Athlete[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class AthleteRepository {
  abstract create(athlete: Athlete): Promise<Athlete>;
  abstract findById(id: string): Promise<Athlete | null>;
  abstract findBySchoolAndId(schoolId: string, id: string): Promise<Athlete | null>;
  abstract findByDocument(documentTypeId: string, documentNumber: string): Promise<Athlete | null>;
  abstract findByEmail(email: string): Promise<Athlete | null>;
  abstract findMany(params: AthleteListParams): Promise<AthleteListResult>;
  abstract update(id: string, data: Partial<Athlete>): Promise<Athlete>;
  abstract softDelete(id: string): Promise<void>;
  abstract addDiscipline(athleteId: string, disciplineId: string): Promise<void>;
  abstract removeDiscipline(athleteId: string, disciplineId: string): Promise<void>;
  abstract addInstitution(athleteId: string, schoolId: string): Promise<void>;
  abstract updatePhoto(athleteId: string, photoUrl: string): Promise<void>;
}
