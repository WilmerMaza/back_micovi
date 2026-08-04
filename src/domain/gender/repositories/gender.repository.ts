import { Gender } from '../entities/gender.entity';

export abstract class GenderRepository {
  abstract findById(id: string): Promise<Gender | null>;
}
