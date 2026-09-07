import { Inject, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { Country } from 'src/domain/country/entities/country.entity';
import { CountryRepository } from 'src/domain/country/repositories/country.repository';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

@Injectable()
export class PrismaCountryRepository implements CountryRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClientLike) {}

  async findById(id: string): Promise<Country | null> {
    const record = await this.prisma.country.findFirst({
      where: { id, deletedAt: null },
    });
    return record ? new Country(record.id, record.name) : null;
  }

  async findAll(): Promise<Country[]> {
    const records = await this.prisma.country.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return records.map((r) => new Country(r.id, r.name));
  }
}
