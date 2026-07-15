import { Inject, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient, Category as PrismaCategory } from '@prisma/client';
import { Category } from 'src/domain/school/entities/category.entity';
import { CategoryRepository } from 'src/domain/school/repositories/category.repository';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

@Injectable()
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClientLike) {}

  async create(category: Category): Promise<Category> {
    const created = await this.prisma.category.create({
      data: {
        id: category.id,
        name: category.name,
        schoolId: category.schoolId,
        minAge: category.minAge,
        maxAge: category.maxAge,
      },
    });
    return this.toDomain(created);
  }

  async findBySchoolId(schoolId: string): Promise<Category[]> {
    const records = await this.prisma.category.findMany({
      where: { schoolId, deletedAt: null },
    });
    return records.map((r) => this.toDomain(r));
  }

  private toDomain(record: PrismaCategory): Category {
    return new Category(record.id, record.name, record.schoolId, record.minAge, record.maxAge);
  }
}
