import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DocumentTypeRepository } from 'src/domain/document-type/repositories/document-type.repository';
import { ListDocumentTypesQuery } from '../list-document-types.query';

@QueryHandler(ListDocumentTypesQuery)
export class ListDocumentTypesHandler implements IQueryHandler<ListDocumentTypesQuery> {
  constructor(private readonly repo: DocumentTypeRepository) {}
  async execute() {
    return this.repo.findAll();
  }
}
