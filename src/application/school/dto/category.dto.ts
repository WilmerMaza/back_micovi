import { ApiProperty } from '@nestjs/swagger';

export class CategoryDto {
  @ApiProperty({ example: 'uuid-v4', description: 'Category unique identifier' })
  id: string;

  @ApiProperty({ example: 'Infantil', description: 'Category name' })
  name: string;

  @ApiProperty({ example: 6, description: 'Minimum age', nullable: true })
  minAge: number | null;

  @ApiProperty({ example: 12, description: 'Maximum age', nullable: true })
  maxAge: number | null;

  constructor(id: string, name: string, minAge: number | null, maxAge: number | null) {
    this.id = id;
    this.name = name;
    this.minAge = minAge;
    this.maxAge = maxAge;
  }
}
