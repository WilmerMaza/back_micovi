import { ApiProperty } from '@nestjs/swagger';

export class SchoolDto {
  @ApiProperty({ example: 'uuid-v4', description: 'Unique identifier for the school' })
  id: string;

  @ApiProperty({ example: 'Escuela Deportiva Águilas', description: 'School name' })
  name: string;

  @ApiProperty({ example: 'Cra. 45 #23-90', description: 'School address' })
  address: string;

  @ApiProperty({ example: '+573001112233', description: 'School phone number' })
  phone: string;

  @ApiProperty({ example: 'uuid-v4', description: 'ID of the associated user account' })
  userId: string;
}
