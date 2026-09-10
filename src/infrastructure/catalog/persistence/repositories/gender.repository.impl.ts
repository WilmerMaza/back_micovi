import { Inject, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { Gender } from 'src/domain/gender/entities/gender.entity';
import { GenderRepository } from 'src/domain/gender/repositories/gender.repository';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

@Injectable()
export class PrismaGenderRepository implements GenderRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClientLike) {}

  async findById(id: string): Promise<Gender | null> {
    const record = await this.prisma.gender.findFirst({
      where: { id, deletedAt: null },
    });
    return record ? new Gender(record.id, record.name) : null;
  }

  async findAll(): Promise<Gender[]> {
    const records = await this.prisma.gender.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return records.map((r) => new Gender(r.id, r.name));
  }
}
