/**
 * Guard CSRF — patrón double-submit cookie.
 *
 * ¿Por qué es necesario con cookies HttpOnly?
 * Las cookies se envían automáticamente en cada petición. Un sitio malicioso
 * podría hacer POST cross-site. Este guard exige que el header X-CSRF-Token
 * coincida con la cookie micovi_csrf (legible por JS del mismo origen).
 *
 * GET/HEAD/OPTIONS están exentos (lectura sin efectos secundarios).
 * Desactivable solo en tests con CSRF_ENABLED=false.
 */
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { COOKIE_NAMES } from 'src/infrastructure/config/cookie.config';

const CSRF_SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const enabled = this.configService.get<string>('CSRF_ENABLED', 'true') === 'true';
    if (!enabled) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    if (CSRF_SAFE_METHODS.has(request.method.toUpperCase())) {
      return true;
    }

    const csrfCookie = request.cookies?.[COOKIE_NAMES.csrfToken] as string | undefined;
    const csrfHeader = request.header('x-csrf-token');

    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}
