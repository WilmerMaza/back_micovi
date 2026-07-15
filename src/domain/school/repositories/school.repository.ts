import { School } from '../entities/school.entity';

export abstract class SchoolRepository {
  abstract create(school: School): Promise<School>;
  abstract findById(id: string): Promise<School | null>;
  abstract findByUserId(userId: string): Promise<School | null>;
  abstract findByTaxId(taxId: string): Promise<School | null>;
  abstract findByName(name: string): Promise<School | null>;
}
