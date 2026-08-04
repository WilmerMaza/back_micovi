import { DocumentType } from '../entities/document-type.entity';

export abstract class DocumentTypeRepository {
  abstract findById(id: string): Promise<DocumentType | null>;
}
