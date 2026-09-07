/**
 * DTO de respuesta paginada para listado de atletas.
 */
import { ApiProperty } from '@nestjs/swagger';
import { AthleteDto } from 'src/application/athlete/dto/athlete.dto';

export class PaginatedAthleteDto {
  @ApiProperty({ type: [AthleteDto] })
  data: AthleteDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
