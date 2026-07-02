/**
 * Configuración centralizada de cookies de autenticación.
 *
 * ¿Por qué existe este archivo?
 * Los atributos de las cookies (HttpOnly, Secure, SameSite, path) deben ser
 * consistentes en login, refresh y logout. Centralizarlos aquí evita divergencias
 * que romperían la sesión (p. ej. borrar una cookie con un path distinto al que
 * se usó al crearla).
 *
 * Guía completa: docs/auth-httpOnly-cookies.md
 */
import { CookieOptions } from 'express';

/** Nombres fijos de cookies. No cambiar sin coordinar con el frontend (Angular). */
export const COOKIE_NAMES = {
  accessToken: 'micovi_access',
  refreshToken: 'micovi_refresh',
  csrfToken: 'micovi_csrf',
} as const;

export interface CookieEnvConfig {
  domain?: string;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  accessTokenMaxAgeMs: number;
  refreshTokenMaxAgeMs: number;
  csrfMaxAgeMs: number;
}

/** Lee TTL y flags de cookies desde variables de entorno validadas en env.validation.ts. */
export function buildCookieEnvConfig(env: Record<string, unknown>): CookieEnvConfig {
  const accessMinutes = Number(env.ACCESS_TOKEN_TTL_MINUTES ?? 15);
  const refreshDays = Number(env.REFRESH_TOKEN_TTL_DAYS ?? 14);
  const sameSite = (env.COOKIE_SAME_SITE as string | undefined)?.toLowerCase() ?? 'lax';

  if (!['strict', 'lax', 'none'].includes(sameSite)) {
    throw new Error('COOKIE_SAME_SITE must be strict, lax or none');
  }

  return {
    domain: (env.COOKIE_DOMAIN as string | undefined) || undefined,
    secure: env.COOKIE_SECURE === 'true' || env.NODE_ENV === 'production',
    sameSite: sameSite as 'strict' | 'lax' | 'none',
    accessTokenMaxAgeMs: accessMinutes * 60 * 1000,
    refreshTokenMaxAgeMs: refreshDays * 24 * 60 * 60 * 1000,
    csrfMaxAgeMs: refreshDays * 24 * 60 * 60 * 1000,
  };
}

/**
 * Access token (JWT). HttpOnly + path /api → se envía en todas las peticiones API.
 * Vida corta (~15 min) para limitar daño si se compromete.
 */
export function accessCookieOptions(config: CookieEnvConfig): CookieOptions {
  return {
    httpOnly: true,
    secure: config.secure,
    sameSite: config.sameSite,
    domain: config.domain,
    path: '/api',
    maxAge: config.accessTokenMaxAgeMs,
  };
}

/**
 * Refresh token opaco. Path /api/auth → solo se envía a endpoints de auth,
 * reduciendo superficie de exposición en peticiones a otros recursos.
 */
export function refreshCookieOptions(config: CookieEnvConfig): CookieOptions {
  return {
    httpOnly: true,
    secure: config.secure,
    sameSite: config.sameSite,
    domain: config.domain,
    path: '/api/auth',
    maxAge: config.refreshTokenMaxAgeMs,
  };
}

/**
 * Token CSRF legible por JavaScript (NO HttpOnly).
 * El frontend lo lee y lo reenvía en el header X-CSRF-Token (patrón double-submit).
 */
export function csrfCookieOptions(config: CookieEnvConfig): CookieOptions {
  return {
    httpOnly: false,
    secure: config.secure,
    sameSite: config.sameSite,
    domain: config.domain,
    path: '/api',
    maxAge: config.csrfMaxAgeMs,
  };
}

/** Opciones para invalidar cookies: mismo path/domain que al crearlas, maxAge 0. */
export function clearCookieOptions(config: CookieEnvConfig, path: string): CookieOptions {
  return {
    httpOnly: true,
    secure: config.secure,
    sameSite: config.sameSite,
    domain: config.domain,
    path,
    maxAge: 0,
  };
}
