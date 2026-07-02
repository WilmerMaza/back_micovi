/**
 * Utilidades criptográficas para tokens de autenticación.
 *
 * - hashToken: nunca persistimos el refresh token en claro; solo su hash SHA-256.
 * - generateSecureToken: refresh opaco de alta entropía (no es JWT).
 * - generateCsrfToken: valor aleatorio para protección CSRF double-submit.
 */
import { createHash, randomBytes } from 'crypto';

/** Hash irreversible del refresh token antes de guardarlo en AuthSession. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateSecureToken(bytes = 48): string {
  return randomBytes(bytes).toString('base64url');
}

export function generateCsrfToken(): string {
  return randomBytes(32).toString('base64url');
}
