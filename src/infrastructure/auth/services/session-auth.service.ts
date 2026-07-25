/**
 * Gestión de sesiones de autenticación (capa infraestructura).
 *
 * ¿Por qué sesiones en BD además del JWT?
 * Un JWT solo no se puede revocar hasta que expire. Las sesiones permiten:
 * - Logout inmediato (revocar refresh token)
 * - Rotación de refresh con detección de reutilización (familyId)
 * - Cerrar todas las sesiones al cambiar contraseña o por un admin
 * - Auditoría (userAgent, ipAddress)
 *
 * Flujo: login → createSession | 401 → refreshSession | logout → revokeSession
 */
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { AuthenticatedUserDto } from 'src/application/auth/dto/authenticated-user.dto';
import { AuthSession } from 'src/domain/auth/entities/auth-session.entity';
import { AuthSessionRepository } from 'src/domain/auth/repositories/auth-session.repository';
import { buildCookieEnvConfig } from 'src/infrastructure/config/cookie.config';
import { generateSecureToken, hashToken } from '../crypto/token.util';
import { CookieAuthService } from './cookie-auth.service';

export interface AuthSessionResult {
  session: AuthSession;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class SessionAuthService {
  private readonly refreshTtlMs: number;

  constructor(
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly cookieAuthService: CookieAuthService,
    @Inject(ConfigService) configService: ConfigService,
  ) {
    const config = buildCookieEnvConfig(configService as unknown as Record<string, unknown>);
    this.refreshTtlMs = config.refreshTokenMaxAgeMs;
  }

  /**
   * Crea una sesión nueva tras login. Cada login genera un familyId único
   * para agrupar rotaciones y detectar robo de refresh token.
   */
  async createSession(
    user: AuthenticatedUserDto,
    meta: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthSessionResult> {
    const refreshToken = generateSecureToken();
    const familyId = randomUUID();
    const expiresAt = new Date(Date.now() + this.refreshTtlMs);

    const session = await this.authSessionRepository.create({
      id: randomUUID(),
      userId: user.id,
      familyId,
      refreshTokenHash: hashToken(refreshToken),
      userAgent: meta.userAgent ?? null,
      ipAddress: meta.ipAddress ?? null,
      expiresAt,
    });

    const accessToken = this.cookieAuthService.signAccessToken(user);
    return { session, accessToken, refreshToken };
  }

  /**
   * Rota refresh token: invalida el hash anterior y emite uno nuevo.
   * Si llega un refresh ya usado/revocado → revoca toda la familia (posible ataque).
   */
  async refreshSession(
    refreshToken: string,
    meta: { userAgent?: string; ipAddress?: string },
    loadUser: (userId: string) => Promise<AuthenticatedUserDto | null>,
  ): Promise<AuthSessionResult> {
    const tokenHash = hashToken(refreshToken);
    const session = await this.authSessionRepository.findByRefreshTokenHash(tokenHash);

    if (!session || !session.isActive) {
      if (session) {
        await this.authSessionRepository.revokeFamily(session.familyId);
      }
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await loadUser(session.userId);
    if (!user) {
      await this.authSessionRepository.revokeById(session.id);
      throw new UnauthorizedException('User not found');
    }

    const newRefreshToken = generateSecureToken();
    const newExpiresAt = new Date(Date.now() + this.refreshTtlMs);

    const rotated = await this.authSessionRepository.rotateRefreshToken(
      session.id,
      hashToken(newRefreshToken),
      newExpiresAt,
    );

    const accessToken = this.cookieAuthService.signAccessToken(user);
    return {
      session: rotated,
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /** Revoca la sesión asociada al refresh token (logout). */
  async revokeSession(refreshToken: string): Promise<void> {
    const session = await this.authSessionRepository.findByRefreshTokenHash(
      hashToken(refreshToken),
    );
    if (session && session.isActive) {
      await this.authSessionRepository.revokeById(session.id);
    }
  }

  /**
   * Invalida todas las sesiones de un usuario.
   * Usar al cambiar contraseña o cuando un admin fuerza cierre de sesiones.
   */
  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.authSessionRepository.revokeAllByUserId(userId);
  }
}
