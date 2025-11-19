import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../domain/auth/entities/user-role.enum';
export class AuthenticatedUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: ['ADMIN', 'SCHOOL', 'COACH'] })
  role: UserRole;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Identifier of the school when role is SCHOOL',
  })
  schoolId?: string | null;
}
