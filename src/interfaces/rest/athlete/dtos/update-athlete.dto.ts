/**
 * DTO para la actualización de datos de un atleta.
 * Todos los campos son opcionales para permitir actualizaciones parciales.
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateAthleteDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  documentTypeId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(30)
  documentNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  genderId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  birthCountryId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  birthDepartmentId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  birthCityId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  residenceCountryId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  residenceDepartmentId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  residenceCityId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  educationLevelId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(200)
  educationInstitution?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(300)
  weight?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0.5)
  @Max(2.5)
  height?: number;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  disciplineId?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;
}
