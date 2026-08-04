import { Inject, Injectable } from '@nestjs/common';
import { Athlete as PrismaAthlete, Prisma, PrismaClient } from '@prisma/client';
import { Athlete } from 'src/domain/athlete/entities/athlete.entity';
import { AthleteAlreadyExistsException } from 'src/domain/athlete/exceptions/athlete-already-exists.exception';
import { AthleteRepository } from 'src/domain/athlete/repositories/athlete.repository';
import { EmailAlreadyInUseException } from 'src/domain/auth/exceptions/email-already-in-use.exception';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

@Injectable()
export class PrismaAthleteRepository implements AthleteRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClientLike) {}

  async create(athlete: Athlete): Promise<Athlete> {
    try {
      const created = await this.prisma.athlete.create({
        data: this.toPersistence(athlete),
      });
      return this.toDomain(created, athlete.schoolId, athlete.disciplineId);
    } catch (error) {
      this.handleUniqueConstraint(error, athlete);
    }
  }

  async findByDocument(documentTypeId: string, documentNumber: string): Promise<Athlete | null> {
    const record = await this.prisma.athlete.findFirst({
      where: { documentTypeId, documentNumber, deletedAt: null },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByEmail(email: string): Promise<Athlete | null> {
    const record = await this.prisma.athlete.findFirst({
      where: { email, deletedAt: null },
    });
    return record ? this.toDomain(record) : null;
  }

  async addDiscipline(athleteId: string, disciplineId: string): Promise<void> {
    await this.prisma.athleteDiscipline.create({
      data: { athleteId, disciplineId },
    });
  }

  async addInstitution(athleteId: string, schoolId: string): Promise<void> {
    await this.prisma.athleteInstitution.create({
      data: { athleteId, schoolId },
    });
  }

  private toDomain(record: PrismaAthlete, schoolId?: string, disciplineId?: string): Athlete {
    return new Athlete(
      record.id,
      `${record.firstName} ${record.lastName}`,
      record.firstName,
      record.lastName,
      this.calculateAge(record.birthDate),
      record.createdAt,
      record.updatedAt,
      record.deletedAt,
      record.documentTypeId,
      record.documentNumber,
      this.toDateString(record.birthDate),
      record.genderId,
      record.birthCountryId,
      record.birthDepartmentId,
      record.birthCityId,
      record.residenceCountryId,
      record.residenceDepartmentId,
      record.residenceCityId,
      record.educationLevelId,
      record.educationInstitution ?? undefined,
      record.categoryId,
      record.weight,
      record.height,
      schoolId,
      disciplineId,
      record.email,
      record.phone ?? undefined,
    );
  }

  private toPersistence(athlete: Athlete): Prisma.AthleteUncheckedCreateInput {
    return {
      id: athlete.id,
      firstName: athlete.firstName,
      lastName: athlete.lastName,
      birthDate: new Date(athlete.birthDate ?? Date.now()),
      documentTypeId: athlete.documentTypeId ?? '',
      documentNumber: athlete.documentNumber ?? '',
      genderId: athlete.genderId ?? '',
      birthCountryId: athlete.birthCountryId ?? '',
      birthDepartmentId: athlete.birthDepartmentId ?? '',
      birthCityId: athlete.birthCityId ?? '',
      residenceCountryId: athlete.residenceCountryId ?? '',
      residenceDepartmentId: athlete.residenceDepartmentId ?? '',
      residenceCityId: athlete.residenceCityId ?? '',
      educationLevelId: athlete.educationLevelId ?? '',
      educationInstitution: athlete.educationInstitution ?? null,
      categoryId: athlete.categoryId ?? '',
      weight: athlete.weight ?? 0,
      height: athlete.height ?? 0,
      email: athlete.email ?? '',
      phone: athlete.phone ?? null,
      coachId: null,
    };
  }

  private handleUniqueConstraint(error: unknown, athlete: Athlete): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = Array.isArray(error.meta?.target) ? error.meta.target : [];
      if (target.includes('email')) {
        throw new EmailAlreadyInUseException(athlete.email ?? '');
      }
      throw new AthleteAlreadyExistsException(
        athlete.documentTypeId ?? '',
        athlete.documentNumber ?? '',
      );
    }
    throw error;
  }

  private calculateAge(birthDate: Date): number {
    const birth = birthDate instanceof Date ? birthDate : new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  private toDateString(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
