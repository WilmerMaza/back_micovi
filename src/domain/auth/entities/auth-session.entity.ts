/**
 * Entidad de dominio: sesión de autenticación.
 *
 * Representa un dispositivo/navegador autenticado. El refresh token real
 * nunca vive aquí — solo refreshTokenHash. familyId agrupa rotaciones
 * del mismo login para detectar reutilización fraudulenta.
 */
export class AuthSession {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly familyId: string,
    public readonly refreshTokenHash: string,
    public readonly userAgent: string | null,
    public readonly ipAddress: string | null,
    public readonly expiresAt: Date,
    public readonly revokedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /** Sesión válida si no fue revocada y no expiró. */
  get isActive(): boolean {
    return !this.revokedAt && this.expiresAt > new Date();
  }
}
