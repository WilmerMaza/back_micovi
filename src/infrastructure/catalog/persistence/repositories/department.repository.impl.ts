import { Inject, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { Department } from 'src/domain/department/entities/department.entity';
import { DepartmentRepository } from 'src/domain/department/repositories/department.repository';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

@Injectable()
export class PrismaDepartmentRepository implements DepartmentRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClientLike) {}

  async findById(id: string): Promise<Department | null> {
    const record = await this.prisma.department.findFirst({
      where: { id, deletedAt: null },
    });
    return record ? new Department(record.id, record.name, record.countryId) : null;
  }

  async findByCountryId(countryId: string): Promise<Department[]> {
    const records = await this.prisma.department.findMany({
      where: { countryId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return records.map((r) => new Department(r.id, r.name, r.countryId));
  }
}
