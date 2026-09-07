import { Inject, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { DocumentType } from 'src/domain/document-type/entities/document-type.entity';
import { DocumentTypeRepository } from 'src/domain/document-type/repositories/document-type.repository';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

@Injectable()
export class PrismaDocumentTypeRepository implements DocumentTypeRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClientLike) {}

  async findById(id: string): Promise<DocumentType | null> {
    const record = await this.prisma.documentType.findFirst({
      where: { id, deletedAt: null },
    });
    return record ? new DocumentType(record.id, record.name) : null;
  }

  async findAll(): Promise<DocumentType[]> {
    const records = await this.prisma.documentType.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return records.map((r) => new DocumentType(r.id, r.name));
  }
}
