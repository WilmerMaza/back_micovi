import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStatus } from 'src/domain/billing/entities/subscription-status.enum';

class PlanSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  price: number;
}

export class SubscriptionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  schoolId: string;

  @ApiProperty()
  planId: string;

  @ApiProperty({ type: PlanSummaryDto })
  plan: PlanSummaryDto;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty({ enum: SubscriptionStatus })
  status: SubscriptionStatus;

  @ApiProperty({ nullable: true })
  canceledAt: Date | null;
}
