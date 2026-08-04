import { ApiProperty } from '@nestjs/swagger';

export class AthleteDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  documentTypeId: string;

  @ApiProperty({ example: '123456789' })
  documentNumber: string;

  @ApiProperty({ example: 'Juan Felipe' })
  firstName: string;

  @ApiProperty({ example: 'Pérez Mendoza' })
  lastName: string;

  @ApiProperty({ example: '2008-05-15' })
  birthDate: string;

  @ApiProperty({ description: 'Edad calculada desde birthDate' })
  age: number;

  @ApiProperty()
  genderId: string;

  @ApiProperty()
  birthCountryId: string;

  @ApiProperty()
  birthDepartmentId: string;

  @ApiProperty()
  birthCityId: string;

  @ApiProperty()
  residenceCountryId: string;

  @ApiProperty()
  residenceDepartmentId: string;

  @ApiProperty()
  residenceCityId: string;

  @ApiProperty()
  educationLevelId: string;

  @ApiProperty({ example: 'Institución Educativa ABC' })
  educationInstitution: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty({ example: 65.4 })
  weight: number;

  @ApiProperty({ example: 1.72 })
  height: number;

  @ApiProperty()
  schoolId: string;

  @ApiProperty()
  disciplineId: string;

  @ApiProperty({ example: 'juan@email.com' })
  email: string;

  @ApiProperty({ example: '3001234567' })
  phone: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
