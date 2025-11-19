import { UserRole } from 'src/domain/auth/entities/user-role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  schoolId?: string | null;
  iat?: number;
  exp?: number;
}
