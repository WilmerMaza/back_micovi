import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { schoolCharacter } from 'src/domain/school/entities/school-chacharacter.enum';
import { InstitutionType } from 'src/domain/school/entities/institution-type.enum';
import { RepresentativeDocumentType } from 'src/domain/school/entities/representative-document-type.enum';

export class CategoryDescriptorDto {
  @ApiProperty({ example: 'Infantil', description: 'Category name' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 6, description: 'Minimum age', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minAge?: number;

  @ApiProperty({ example: 12, description: 'Maximum age', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAge?: number;
}

export class RegisterSchoolDto {
  @ApiProperty({
    example: 'Escuela Deportiva Águilas',
    description: 'Name of the sports school',
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    example: 'Cra. 45 #23-90',
    description: 'School physical address',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  address: string;

  @ApiProperty({
    example: '+573001112233',
    description: 'School contact phone number',
  })
  @IsOptional()
  @IsString()
  @MinLength(7)
  phone: string;

  @ApiProperty({
    example: 'Colombia',
    description: 'Country where the school is located',
  })
  @IsString()
  @MinLength(3)
  country: string;

  @ApiPropertyOptional({
    example: 'Bolívar',
    description: 'State/region of the school',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  state?: string;

  @ApiPropertyOptional({
    example: 'Cartagena',
    description: 'City where the school is located',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  city?: string;

  @ApiProperty({
    example: 'PUBLIC',
    enum: schoolCharacter,
    description: 'Character of the school (e.g., PUBLIC or PRIVATE)',
  })
  @IsEnum(schoolCharacter)
  character: schoolCharacter;

  @ApiPropertyOptional({
    example: InstitutionType.ACADEMY,
    enum: InstitutionType,
    description: 'Type of sports institution',
  })
  @IsOptional()
  @IsEnum(InstitutionType)
  institutionType?: InstitutionType;

  @ApiPropertyOptional({
    example: '901123456-7',
    description: 'Tax ID (NIT/RUC) of the institution',
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  taxId?: string;

  @ApiPropertyOptional({
    example: 'Sede Principal',
    description: 'Headquarters of the school',
  })
  @IsOptional()
  @IsString()
  headquarters?: string;

  @ApiProperty({
    example: 'https://www.escueladeportivaaguilas.com',
    description: 'Official website of the school',
    required: false,
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Name of the school representative',
  })
  @IsString()
  @MinLength(3)
  representativename: string;

  @ApiPropertyOptional({
    example: RepresentativeDocumentType.CC,
    enum: RepresentativeDocumentType,
    description: 'Document type of the school representative',
  })
  @IsOptional()
  @IsEnum(RepresentativeDocumentType)
  representativeDocumentType?: RepresentativeDocumentType;

  @ApiProperty({
    example: 'escuela@correo.com',
    description: 'Email address for the admin user of the school',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'superSecret123',
    description: 'Password for the school admin user (minimum 8 characters)',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'https://logo.example.com/logo.png',
    description: 'URL of the institution logo',
    required: false,
  })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({
    example: '2024-01-15',
    description: 'Foundation date of the institution (ISO 8601)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  foundationDate?: string;

  @ApiProperty({
    example: 10.4806,
    description: 'Latitude coordinate',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({
    example: -66.9036,
    description: 'Longitude coordinate',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    example: ['uuid-discipline-1', 'uuid-discipline-2'],
    description: 'IDs of existing sport disciplines to associate',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  disciplineIds?: string[];

  @ApiPropertyOptional({
    type: [CategoryDescriptorDto],
    description: 'Age categories to create for the institution',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryDescriptorDto)
  categories?: CategoryDescriptorDto[];
}
