/**
 * Adaptador Prisma del puerto AuthSessionRepository (capa infraestructura).
 *
 * Persiste sesiones en la tabla AuthSession. Solo guarda el hash del refresh token,
 * nunca el valor en claro. Implementa el contrato definido en domain/auth.
 */
import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthSession } from 'src/domain/auth/entities/auth-session.entity';
import {
  AuthSessionRepository,
  CreateAuthSessionInput,
} from 'src/domain/auth/repositories/auth-session.repository';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

@Injectable()
export class PrismaAuthSessionRepository implements AuthSessionRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClientLike) {}

  async create(input: CreateAuthSessionInput): Promise<AuthSession> {
    const created = await this.prisma.authSession.create({
      data: {
        id: input.id,
        userId: input.userId,
        familyId: input.familyId,
        refreshTokenHash: input.refreshTokenHash,
        userAgent: input.userAgent,
        ipAddress: input.ipAddress,
        expiresAt: input.expiresAt,
      },
    });
    return this.toDomain(created);
  }

  async findByRefreshTokenHash(hash: string): Promise<AuthSession | null> {
    const record = await this.prisma.authSession.findUnique({
      where: { refreshTokenHash: hash },
    });
    return record ? this.toDomain(record) : null;
  }

  async findActiveById(id: string): Promise<AuthSession | null> {
    const record = await this.prisma.authSession.findFirst({
      where: { id, revokedAt: null, expiresAt: { gt: new Date() } },
    });
    return record ? this.toDomain(record) : null;
  }

  async revokeById(id: string): Promise<void> {
    await this.prisma.authSession.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  /** Marca revokedAt en todas las sesiones activas del mismo familyId (detección de robo). */
  async revokeFamily(familyId: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Sustituye el hash del refresh y extiende expiresAt sin crear fila nueva. */
  async rotateRefreshToken(
    sessionId: string,
    newRefreshTokenHash: string,
    newExpiresAt: Date,
  ): Promise<AuthSession> {
    const updated = await this.prisma.authSession.update({
      where: { id: sessionId },
      data: {
        refreshTokenHash: newRefreshTokenHash,
        expiresAt: newExpiresAt,
        updatedAt: new Date(),
      },
    });
    return this.toDomain(updated);
  }

  private toDomain(record: {
    id: string;
    userId: string;
    familyId: string;
    refreshTokenHash: string;
    userAgent: string | null;
    ipAddress: string | null;
    expiresAt: Date;
    revokedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): AuthSession {
    return new AuthSession(
      record.id,
      record.userId,
      record.familyId,
      record.refreshTokenHash,
      record.userAgent,
      record.ipAddress,
      record.expiresAt,
      record.revokedAt,
      record.createdAt,
      record.updatedAt,
    );
  }
}
