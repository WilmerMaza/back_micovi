import { ApiProperty } from '@nestjs/swagger';

export class PlanDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ example: 49.99 })
  price: number;

  @ApiProperty({
    description: 'Billing period length expressed in whole months',
    example: 1,
  })
  billingPeriodMonths: number;

  @ApiProperty({ required: false, nullable: true })
  maxCoaches: number | null;

  @ApiProperty({ required: false, nullable: true })
  maxAthletes: number | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
