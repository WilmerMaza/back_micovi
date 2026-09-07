/**
 * Implementación Prisma del repositorio de atletas.
 *
 * Maneja persistencia de atletas, relaciones con disciplinas e instituciones,
 * y consultas con filtros, búsqueda y paginación.
 */
import { Inject, Injectable } from '@nestjs/common';
import { Athlete as PrismaAthlete, Prisma, PrismaClient } from '@prisma/client';
import { Athlete } from 'src/domain/athlete/entities/athlete.entity';
import { AthleteAlreadyExistsException } from 'src/domain/athlete/exceptions/athlete-already-exists.exception';
import {
  AthleteListParams,
  AthleteListResult,
  AthleteRepository,
} from 'src/domain/athlete/repositories/athlete.repository';
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

  async findById(id: string): Promise<Athlete | null> {
    const record = await this.prisma.athlete.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) return null;

    const institution = await this.prisma.athleteInstitution.findFirst({
      where: { athleteId: id },
    });
    const discipline = await this.prisma.athleteDiscipline.findFirst({
      where: { athleteId: id },
    });

    return this.toDomain(record, institution?.schoolId, discipline?.disciplineId);
  }

  async findBySchoolAndId(schoolId: string, id: string): Promise<Athlete | null> {
    const record = await this.prisma.athlete.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) return null;

    const institution = await this.prisma.athleteInstitution.findFirst({
      where: { athleteId: id, schoolId },
    });
    if (!institution) return null;

    const discipline = await this.prisma.athleteDiscipline.findFirst({
      where: { athleteId: id },
    });

    return this.toDomain(record, schoolId, discipline?.disciplineId);
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

  async findMany(params: AthleteListParams): Promise<AthleteListResult> {
    const { schoolId, search, categoryId, disciplineId, genderId, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.AthleteWhereInput = {
      deletedAt: null,
      institutions: { some: { schoolId } },
    };

    if (search) {
      const searchTerms = search.trim().split(/\s+/);
      where.AND = searchTerms.map((term) => ({
        OR: [
          { firstName: { contains: term, mode: 'insensitive' } },
          { lastName: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
          { documentNumber: { contains: term, mode: 'insensitive' } },
        ],
      }));
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (genderId) {
      where.genderId = genderId;
    }

    if (disciplineId) {
      where.disciplines = { some: { disciplineId } };
    }

    const [records, total] = await Promise.all([
      this.prisma.athlete.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.athlete.count({ where }),
    ]);

    const athletes = await Promise.all(
      records.map(async (record) => {
        const institution = await this.prisma.athleteInstitution.findFirst({
          where: { athleteId: record.id, schoolId },
        });
        const discipline = await this.prisma.athleteDiscipline.findFirst({
          where: { athleteId: record.id },
        });
        return this.toDomain(record, institution?.schoolId, discipline?.disciplineId);
      }),
    );

    return {
      data: athletes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, data: Partial<Athlete>): Promise<Athlete> {
    const existing = await this.prisma.athlete.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw new Error(`Athlete with id "${id}" not found`);
    }

    const updateData: Prisma.AthleteUncheckedUpdateInput = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.birthDate !== undefined) updateData.birthDate = new Date(data.birthDate);
    if (data.documentTypeId !== undefined) updateData.documentTypeId = data.documentTypeId;
    if (data.documentNumber !== undefined) updateData.documentNumber = data.documentNumber;
    if (data.genderId !== undefined) updateData.genderId = data.genderId;
    if (data.birthCountryId !== undefined) updateData.birthCountryId = data.birthCountryId;
    if (data.birthDepartmentId !== undefined) updateData.birthDepartmentId = data.birthDepartmentId;
    if (data.birthCityId !== undefined) updateData.birthCityId = data.birthCityId;
    if (data.residenceCountryId !== undefined)
      updateData.residenceCountryId = data.residenceCountryId;
    if (data.residenceDepartmentId !== undefined)
      updateData.residenceDepartmentId = data.residenceDepartmentId;
    if (data.residenceCityId !== undefined) updateData.residenceCityId = data.residenceCityId;
    if (data.educationLevelId !== undefined) updateData.educationLevelId = data.educationLevelId;
    if (data.educationInstitution !== undefined)
      updateData.educationInstitution = data.educationInstitution;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.weight !== undefined) updateData.weight = data.weight;
    if (data.height !== undefined) updateData.height = data.height;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;

    try {
      const updated = await this.prisma.athlete.update({
        where: { id },
        data: updateData,
      });

      const institution = await this.prisma.athleteInstitution.findFirst({
        where: { athleteId: id },
      });
      const discipline = await this.prisma.athleteDiscipline.findFirst({
        where: { athleteId: id },
      });

      return this.toDomain(updated, institution?.schoolId, discipline?.disciplineId);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = Array.isArray(error.meta?.target) ? error.meta.target : [];
        if (target.includes('email')) {
          throw new EmailAlreadyInUseException(data.email ?? '');
        }
        throw new AthleteAlreadyExistsException(
          data.documentTypeId ?? existing.documentTypeId,
          data.documentNumber ?? existing.documentNumber,
        );
      }
      throw error;
    }
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.athlete.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async addDiscipline(athleteId: string, disciplineId: string): Promise<void> {
    const existing = await this.prisma.athleteDiscipline.findFirst({
      where: { athleteId, disciplineId },
    });
    if (!existing) {
      await this.prisma.athleteDiscipline.create({
        data: { athleteId, disciplineId },
      });
    }
  }

  async removeDiscipline(athleteId: string, disciplineId: string): Promise<void> {
    await this.prisma.athleteDiscipline.deleteMany({
      where: { athleteId, disciplineId },
    });
  }

  async addInstitution(athleteId: string, schoolId: string): Promise<void> {
    const existing = await this.prisma.athleteInstitution.findFirst({
      where: { athleteId, schoolId },
    });
    if (!existing) {
      await this.prisma.athleteInstitution.create({
        data: { athleteId, schoolId },
      });
    }
  }

  async updatePhoto(athleteId: string, photoUrl: string): Promise<void> {
    await this.prisma.athlete.update({
      where: { id: athleteId },
      data: { photoUrl },
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
      record.photoUrl ?? null,
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
      photoUrl: athlete.photoUrl ?? null,
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
