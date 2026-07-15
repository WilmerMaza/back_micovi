import { Inject, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient, SportDiscipline as PrismaSportDiscipline } from '@prisma/client';
import { SportDiscipline } from 'src/domain/school/entities/sport-discipline.entity';
import { SportDisciplineRepository } from 'src/domain/school/repositories/sport-discipline.repository';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

@Injectable()
export class PrismaSportDisciplineRepository implements SportDisciplineRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClientLike) {}

  async findById(id: string): Promise<SportDiscipline | null> {
    const record = await this.prisma.sportDiscipline.findFirst({
      where: { id, deletedAt: null },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByName(name: string): Promise<SportDiscipline | null> {
    const record = await this.prisma.sportDiscipline.findFirst({
      where: { name, deletedAt: null },
    });
    return record ? this.toDomain(record) : null;
  }

  async findAllByIds(ids: string[]): Promise<SportDiscipline[]> {
    const records = await this.prisma.sportDiscipline.findMany({
      where: { id: { in: ids }, deletedAt: null },
    });
    return records.map((r) => this.toDomain(r));
  }

  async create(discipline: SportDiscipline): Promise<SportDiscipline> {
    const created = await this.prisma.sportDiscipline.create({
      data: {
        id: discipline.id,
        name: discipline.name,
        description: discipline.description,
      },
    });
    return this.toDomain(created);
  }

  async findAll(): Promise<SportDiscipline[]> {
    const records = await this.prisma.sportDiscipline.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  async addSchoolDiscipline(schoolId: string, disciplineId: string): Promise<void> {
    await this.prisma.schoolDiscipline.create({
      data: {
        schoolId,
        disciplineId,
      },
    });
  }

  private toDomain(record: PrismaSportDiscipline): SportDiscipline {
    return new SportDiscipline(record.id, record.name, record.description);
  }
}
