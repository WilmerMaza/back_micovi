import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePlanDto {
  @ApiProperty({ example: 'Premium' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Incluye hasta 10 entrenadores y 200 atletas' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 49.99 })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ example: 1, description: 'Duración del periodo de facturación en meses' })
  @IsInt()
  @Min(1)
  billingPeriodMonths: number;

  @ApiProperty({ example: 10, required: false, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxCoaches?: number;

  @ApiProperty({ example: 200, required: false, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxAthletes?: number;
}
