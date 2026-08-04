import { Inject, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { City } from 'src/domain/city/entities/city.entity';
import { CityRepository } from 'src/domain/city/repositories/city.repository';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

@Injectable()
export class PrismaCityRepository implements CityRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClientLike) {}

  async findById(id: string): Promise<City | null> {
    const record = await this.prisma.city.findFirst({
      where: { id, deletedAt: null },
    });
    return record ? new City(record.id, record.name, record.departmentId) : null;
  }
}
