import { ApiProperty } from '@nestjs/swagger';

export class PlanStatusDto {
  @ApiProperty()
  schoolId: string;

  @ApiProperty()
  active: boolean;

  @ApiProperty({ nullable: true })
  planId: string | null;

  @ApiProperty({ nullable: true })
  planName: string | null;

  @ApiProperty({ nullable: true })
  expiresAt: Date | null;

  @ApiProperty({ nullable: true })
  maxCoaches: number | null;

  @ApiProperty({ nullable: true })
  maxAthletes: number | null;

  @ApiProperty()
  currentCoaches: number;

  @ApiProperty()
  currentAthletes: number;

  @ApiProperty()
  withinLimits: boolean;
}
