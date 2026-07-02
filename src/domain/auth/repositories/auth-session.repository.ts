/**
 * Puerto de persistencia de sesiones (capa dominio).
 *
 * Define el contrato que debe implementar Prisma (u otro adaptador).
 * El dominio no conoce NestJS ni SQL — solo operaciones de negocio
 * sobre sesiones: crear, rotar, revocar.
 */
import { AuthSession } from '../entities/auth-session.entity';

export interface CreateAuthSessionInput {
  id: string;
  userId: string;
  familyId: string;
  refreshTokenHash: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  expiresAt: Date;
}

export abstract class AuthSessionRepository {
  abstract create(input: CreateAuthSessionInput): Promise<AuthSession>;
  abstract findByRefreshTokenHash(hash: string): Promise<AuthSession | null>;
  abstract findActiveById(id: string): Promise<AuthSession | null>;
  abstract revokeById(id: string): Promise<void>;
  abstract revokeFamily(familyId: string): Promise<void>;
  abstract revokeAllByUserId(userId: string): Promise<void>;
  abstract rotateRefreshToken(
    sessionId: string,
    newRefreshTokenHash: string,
    newExpiresAt: Date,
  ): Promise<AuthSession>;
}
