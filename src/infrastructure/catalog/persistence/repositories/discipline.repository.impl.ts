import { Inject, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { Discipline } from 'src/domain/discipline/entities/discipline.entity';
import { DisciplineRepository } from 'src/domain/discipline/repositories/discipline.repository';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

@Injectable()
export class PrismaDisciplineRepository implements DisciplineRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClientLike) {}

  async findById(id: string): Promise<Discipline | null> {
    const record = await this.prisma.discipline.findFirst({
      where: { id, deletedAt: null },
    });
    return record ? new Discipline(record.id, record.name, record.schoolId) : null;
  }
}
