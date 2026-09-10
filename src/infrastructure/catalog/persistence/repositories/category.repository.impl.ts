import { Inject, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { Category } from 'src/domain/category/entities/category.entity';
import { CategoryRepository } from 'src/domain/category/repositories/category.repository';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

@Injectable()
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClientLike) {}

  async findById(id: string): Promise<Category | null> {
    const record = await this.prisma.category.findFirst({
      where: { id, deletedAt: null },
    });
    return record ? new Category(record.id, record.name, record.schoolId) : null;
  }

  async findBySchoolId(schoolId: string): Promise<Category[]> {
    const records = await this.prisma.category.findMany({
      where: { schoolId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return records.map((r) => new Category(r.id, r.name, r.schoolId));
  }
}
