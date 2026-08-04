import { ApiProperty } from '@nestjs/swagger';

export class SportDisciplineDto {
  @ApiProperty({ example: 'uuid-v4', description: 'Sport discipline unique identifier' })
  id: string;

  @ApiProperty({ example: 'Fútbol', description: 'Discipline name' })
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}
