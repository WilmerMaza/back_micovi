/**
 * Puerto de repositorio para catálogo de géneros.
 */
import { Gender } from '../entities/gender.entity';

export abstract class GenderRepository {
  abstract findById(id: string): Promise<Gender | null>;
  abstract findAll(): Promise<Gender[]>;
}
