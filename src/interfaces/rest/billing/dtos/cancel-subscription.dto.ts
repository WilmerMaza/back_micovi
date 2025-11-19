import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class CancelSubscriptionDto {
  @ApiProperty({
    required: false,
    description: 'Fecha efectiva de finalización (ISO 8601). Por defecto se usa la fecha actual.',
  })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;
}
