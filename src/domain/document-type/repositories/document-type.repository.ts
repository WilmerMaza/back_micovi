/**
 * Puerto de repositorio para catálogo de tipos de documento.
 */
import { DocumentType } from '../entities/document-type.entity';

export abstract class DocumentTypeRepository {
  abstract findById(id: string): Promise<DocumentType | null>;
  abstract findAll(): Promise<DocumentType[]>;
}
