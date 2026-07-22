import { Inject, Injectable } from '@nestjs/common';
import { Athlete as PrismaAthlete, Prisma, PrismaClient } from '@prisma/client';
import { Athlete } from 'src/domain/athlete/entities/athlete.entity';
import { AthleteRepository } from 'src/domain/athlete/repositories/athlete.repository';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

@Injectable()
export class PrismaAthleteRepository implements AthleteRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClientLike) {}

  async create(athlete: Athlete): Promise<Athlete> {
    const created = await this.prisma.athlete.create({
      data: this.toPersistence(athlete),
    });
    return this.toDomain(created);
  }

  findByDocument(documentTypeId: string, documentNumber: string): Promise<Athlete | null> {
    void documentTypeId;
    void documentNumber;
    // TODO: [DB] Implement when documentTypeId + documentNumber columns exist
    return Promise.resolve(null);
  }

  findByEmail(email: string): Promise<Athlete | null> {
    void email;
    // TODO: [DB] Implement when email column exists
    return Promise.resolve(null);
  }

  private toDomain(record: PrismaAthlete): Athlete {
    return new Athlete(
      record.id,
      record.name,
      '', // TODO: [DB] Map when firstName column exists
      '', // TODO: [DB] Map when lastName column exists
      record.age,
      record.createdAt,
      record.updatedAt,
      record.deletedAt,
    );
  }

  private toPersistence(athlete: Athlete): Prisma.AthleteCreateInput {
    const data = {
      id: athlete.id,
      name: athlete.name,
      age: athlete.age,
      // TODO: [DB] Remove coach relation when schema no longer requires coachId on Athlete
    } as Prisma.AthleteCreateInput;

    return data;
  }
}
