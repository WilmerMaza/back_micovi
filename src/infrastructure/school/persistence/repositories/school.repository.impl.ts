import { Inject, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient, School as PrismaSchool } from '@prisma/client';
import { schoolCharacter } from 'src/domain/school/entities/school-chacharacter.enum';
import { School } from 'src/domain/school/entities/school.entity';
import { SchoolRepository } from 'src/domain/school/repositories/school.repository';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

@Injectable()
export class PrismaSchoolRepository implements SchoolRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClientLike) {}

  async create(school: School): Promise<School> {
    const created = await this.prisma.school.create({
      data: {
        id: school.id,
        name: school.name,
        userId: school.userId,
        character: school.character,
        headquarters: school.headquarters,
        website: school.website,
        representativename: school.representativename,
      },
    });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<School | null> {
    const record = await this.prisma.school.findFirst({
      where: { id, deletedAt: null },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByUserId(userId: string): Promise<School | null> {
    const record = await this.prisma.school.findFirst({
      where: { userId, deletedAt: null },
    });
    return record ? this.toDomain(record) : null;
  }

  private toDomain(record: PrismaSchool): School {
    return new School(
      record.id,
      record.name,
      record.userId,
      record.character as schoolCharacter,
      record.headquarters,
      record.website,
      record.representativename,
    );
  }
}
