import { School } from '../entities/school.entity';

export abstract class SchoolRepository {
  abstract create(school: School): Promise<School>;
}
