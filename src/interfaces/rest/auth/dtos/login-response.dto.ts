import { ApiProperty } from '@nestjs/swagger';
import { AuthenticatedUserDto } from 'src/application/auth/dto/authenticated-user.dto';

export class LoginResponseDto {
  @ApiProperty({ type: AuthenticatedUserDto })
  user: AuthenticatedUserDto;

  @ApiProperty({ description: 'JWT bearer token' })
  accessToken: string;
}
