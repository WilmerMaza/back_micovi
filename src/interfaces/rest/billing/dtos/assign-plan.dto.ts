import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class AssignPlanDto {
  @ApiProperty({ example: 'uuid-plan' })
  @IsUUID()
  planId: string;

  @ApiProperty({
    required: false,
    description: 'Fecha de inicio de la suscripción (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    required: false,
    description: 'Fecha de finalización personalizada (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
