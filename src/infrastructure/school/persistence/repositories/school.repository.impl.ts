import { Injectable } from '@nestjs/common';
import { School as PrismaSchool } from '@prisma/client';
import { School } from 'src/domain/school/entities/school.entity';
import { SchoolRepository } from 'src/domain/school/repositories/school.repository';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';

@Injectable()
export class PrismaSchoolRepository implements SchoolRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(school: School): Promise<School> {
    const created = await this.prisma.school.create({
      data: {
        id: school.id,
        name: school.name,
        address: school.address,
        phone: school.phone,
        userId: school.userId,
      },
    });
    return this.toDomain(created);
  }

  private toDomain(record: PrismaSchool): School {
    return new School(record.id, record.name, record.address, record.phone, record.userId);
  }
}
