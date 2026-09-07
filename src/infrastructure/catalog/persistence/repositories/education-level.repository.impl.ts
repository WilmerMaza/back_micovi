import { Inject, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { EducationLevel } from 'src/domain/education-level/entities/education-level.entity';
import { EducationLevelRepository } from 'src/domain/education-level/repositories/education-level.repository';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

@Injectable()
export class PrismaEducationLevelRepository implements EducationLevelRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClientLike) {}

  async findById(id: string): Promise<EducationLevel | null> {
    const record = await this.prisma.educationLevel.findFirst({
      where: { id, deletedAt: null },
    });
    return record ? new EducationLevel(record.id, record.name) : null;
  }

  async findAll(): Promise<EducationLevel[]> {
    const records = await this.prisma.educationLevel.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return records.map((r) => new EducationLevel(r.id, r.name));
  }
}
