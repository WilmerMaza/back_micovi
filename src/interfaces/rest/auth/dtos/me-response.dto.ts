/**
 * DTO de respuesta del perfil autenticado.
 *
 * Es lo único que el frontend guarda en memoria (Signals).
 * Nunca incluye accessToken ni refreshToken.
 */
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/domain/auth/entities/user-role.enum';

export class MeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ nullable: true })
  schoolId: string | null;
}
