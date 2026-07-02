/**
 * Servicio de cookies de autenticación (capa infraestructura).
 *
 * Responsabilidad: firmar el access JWT y escribir/limpiar cookies HTTP.
 * NO gestiona sesiones en BD — eso lo hace SessionAuthService.
 *
 * El frontend nunca recibe tokens en el body; solo cookies Set-Cookie.
 */
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { AuthenticatedUserDto } from 'src/application/auth/dto/authenticated-user.dto';
import {
  COOKIE_NAMES,
  CookieEnvConfig,
  accessCookieOptions,
  buildCookieEnvConfig,
  clearCookieOptions,
  csrfCookieOptions,
  refreshCookieOptions,
} from 'src/infrastructure/config/cookie.config';
import { generateCsrfToken } from '../crypto/token.util';

@Injectable()
export class CookieAuthService {
  private readonly cookieConfig: CookieEnvConfig;

  constructor(
    private readonly jwtService: JwtService,
    @Inject(ConfigService) configService: ConfigService,
  ) {
    this.cookieConfig = buildCookieEnvConfig(configService as unknown as Record<string, unknown>);
  }

  getConfig(): CookieEnvConfig {
    return this.cookieConfig;
  }

  /** Firma un JWT corto con claims mínimos para autorización en cada request. */
  signAccessToken(user: AuthenticatedUserDto): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId ?? null,
    });
  }

  /** Emite las 3 cookies tras login exitoso. Retorna el CSRF para uso interno si se necesita. */
  setAuthCookies(res: Response, accessToken: string, refreshToken: string): string {
    const csrfToken = generateCsrfToken();

    res.cookie(COOKIE_NAMES.accessToken, accessToken, accessCookieOptions(this.cookieConfig));
    res.cookie(COOKIE_NAMES.refreshToken, refreshToken, refreshCookieOptions(this.cookieConfig));
    res.cookie(COOKIE_NAMES.csrfToken, csrfToken, csrfCookieOptions(this.cookieConfig));

    return csrfToken;
  }

  /** Actualiza access + refresh tras rotación; el CSRF no cambia hasta nuevo login. */
  rotateAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    res.cookie(COOKIE_NAMES.accessToken, accessToken, accessCookieOptions(this.cookieConfig));
    res.cookie(COOKIE_NAMES.refreshToken, refreshToken, refreshCookieOptions(this.cookieConfig));
  }

  /** Logout: invalida cookies en el navegador (paths deben coincidir con los de creación). */
  clearAuthCookies(res: Response): void {
    res.clearCookie(COOKIE_NAMES.accessToken, clearCookieOptions(this.cookieConfig, '/api'));
    res.clearCookie(COOKIE_NAMES.refreshToken, clearCookieOptions(this.cookieConfig, '/api/auth'));
    res.clearCookie(COOKIE_NAMES.csrfToken, clearCookieOptions(this.cookieConfig, '/api'));
  }
}
