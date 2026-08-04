import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class RegisterAthleteDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'ID del tipo de identificación',
  })
  @IsUUID()
  @IsNotEmpty()
  documentTypeId: string;

  @ApiProperty({ example: '123456789', description: 'Número de identificación' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  documentNumber: string;

  @ApiProperty({ example: 'Juan Felipe', description: 'Nombres del deportista' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Pérez Mendoza', description: 'Apellidos del deportista' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: '2008-05-15', description: 'Fecha de nacimiento (ISO 8601)' })
  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002', description: 'ID del género' })
  @IsUUID()
  @IsNotEmpty()
  genderId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440003',
    description: 'ID del país de nacimiento',
  })
  @IsUUID()
  @IsNotEmpty()
  birthCountryId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440004',
    description: 'ID del departamento de nacimiento',
  })
  @IsUUID()
  @IsNotEmpty()
  birthDepartmentId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440005',
    description: 'ID de la ciudad de nacimiento',
  })
  @IsUUID()
  @IsNotEmpty()
  birthCityId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440006',
    description: 'ID del país de residencia',
  })
  @IsUUID()
  @IsNotEmpty()
  residenceCountryId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440007',
    description: 'ID del departamento de residencia',
  })
  @IsUUID()
  @IsNotEmpty()
  residenceDepartmentId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440008',
    description: 'ID de la ciudad de residencia',
  })
  @IsUUID()
  @IsNotEmpty()
  residenceCityId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440009',
    description: 'ID del nivel educativo',
  })
  @IsUUID()
  @IsNotEmpty()
  educationLevelId: string;

  @ApiProperty({ example: 'Institución Educativa ABC', description: 'Institución educativa' })
  @IsString()
  @MaxLength(200)
  educationInstitution: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440010',
    description: 'ID de la categoría deportiva',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: 65.4, description: 'Masa corporal en kilogramos' })
  @IsNumber()
  @Min(1)
  @Max(300)
  weight: number;

  @ApiProperty({ example: 1.72, description: 'Estatura en metros' })
  @IsNumber()
  @Min(0.5)
  @Max(2.5)
  height: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440011',
    description: 'ID de la institución deportiva',
  })
  @IsUUID()
  @IsNotEmpty()
  schoolId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440012',
    description: 'ID de la disciplina deportiva',
  })
  @IsUUID()
  @IsNotEmpty()
  disciplineId: string;

  @ApiProperty({ example: 'juan@email.com', description: 'Correo electrónico del deportista' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '3001234567', description: 'Teléfono de contacto' })
  @IsString()
  @MaxLength(20)
  phone: string;
}
