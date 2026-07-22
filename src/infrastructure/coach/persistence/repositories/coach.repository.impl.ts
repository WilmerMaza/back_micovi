import { Inject, Injectable } from '@nestjs/common';
import { Coach as PrismaCoach, Prisma, PrismaClient } from '@prisma/client';
import { Coach } from 'src/domain/coach/entities/coach.entity';
import { CoachRepository } from 'src/domain/coach/repositories/coach.repository';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

@Injectable()
export class PrismaCoachRepository implements CoachRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClientLike) {}

  async findById(id: string): Promise<Coach | null> {
    const record = await this.prisma.coach.findFirst({
      where: { id, deletedAt: null },
    });
    return record ? this.toDomain(record) : null;
  }

  private toDomain(record: PrismaCoach): Coach {
    return new Coach(record.id, record.name, record.specialty, record.userId, record.schoolId);
  }
}
