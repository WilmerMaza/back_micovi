import {
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PlanStatusDto } from 'src/application/billing/dto/plan-status.dto';
import { SubscriptionDto } from 'src/application/billing/dto/subscription.dto';
import { AssignPlanToSchoolCommand } from 'src/application/billing/subscriptions/commands/assign-plan-to-school.command';
import { CancelSubscriptionCommand } from 'src/application/billing/subscriptions/commands/cancel-subscription.command';
import { GetPlanStatusQuery } from 'src/application/billing/subscriptions/queries/get-plan-status.query';
import { GetCurrentSubscriptionQuery } from 'src/application/billing/subscriptions/queries/get-current-subscription.query';
import { ListSubscriptionsQuery } from 'src/application/billing/subscriptions/queries/list-subscriptions.query';
import { ActiveSubscriptionOverlapException } from 'src/domain/billing/exceptions/active-subscription-overlap.exception';
import { PlanNotFoundException } from 'src/domain/billing/exceptions/plan-not-found.exception';
import { SubscriptionInvalidStateException } from 'src/domain/billing/exceptions/subscription-invalid-state.exception';
import { SubscriptionNotFoundException } from 'src/domain/billing/exceptions/subscription-not-found.exception';
import { SchoolNotFoundException } from 'src/domain/school/exceptions/school-not-found.exception';
import { UserRole } from 'src/domain/auth/entities/user-role.enum';
import { JwtAuthGuard } from 'src/infrastructure/auth/http/guard/jwt-auth.guard';
import { RolesGuard } from 'src/infrastructure/auth/http/guard/roles.guard';
import { Roles } from 'src/infrastructure/auth/http/decorators/roles.decorator';
import { SchoolOwnershipGuard } from 'src/infrastructure/auth/http/guard/school-ownership.guard';
import { AssignPlanDto } from '../dtos/assign-plan.dto';
import { CancelSubscriptionDto } from '../dtos/cancel-subscription.dto';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SchoolOwnershipGuard)
@Controller('schools/:schoolId')
export class SubscriptionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('subscriptions')
  @Roles(UserRole.ADMIN, UserRole.SCHOOL)
  @ApiParam({ name: 'schoolId', type: 'string' })
  @ApiOperation({ summary: 'Assign a plan to a school' })
  @ApiBody({ type: AssignPlanDto })
  @ApiCreatedResponse({ type: SubscriptionDto })
  async assign(
    @Param('schoolId') schoolId: string,
    @Body() dto: AssignPlanDto,
  ): Promise<SubscriptionDto> {
    try {
      return await this.commandBus.execute(
        new AssignPlanToSchoolCommand(
          schoolId,
          dto.planId,
          dto.startDate ? new Date(dto.startDate) : undefined,
          dto.endDate ? new Date(dto.endDate) : undefined,
        ),
      );
    } catch (error) {
      if (error instanceof SchoolNotFoundException || error instanceof PlanNotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (
        error instanceof ActiveSubscriptionOverlapException ||
        error instanceof SubscriptionInvalidStateException
      ) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Patch('subscriptions/:subscriptionId')
  @Roles(UserRole.ADMIN, UserRole.SCHOOL)
  @ApiParam({ name: 'schoolId', type: 'string' })
  @ApiOperation({ summary: 'Cancel an existing subscription' })
  @ApiBody({ type: CancelSubscriptionDto })
  @ApiParam({ name: 'subscriptionId', type: 'string' })
  @ApiOkResponse({ type: SubscriptionDto })
  async cancel(
    @Param('schoolId') schoolId: string,
    @Param('subscriptionId') subscriptionId: string,
    @Body() dto: CancelSubscriptionDto,
  ): Promise<SubscriptionDto> {
    try {
      return await this.commandBus.execute(
        new CancelSubscriptionCommand(
          schoolId,
          subscriptionId,
          dto.effectiveDate ? new Date(dto.effectiveDate) : undefined,
        ),
      );
    } catch (error) {
      if (error instanceof SubscriptionNotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof SubscriptionInvalidStateException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Get('subscriptions/current')
  @Roles(UserRole.ADMIN, UserRole.SCHOOL)
  @ApiParam({ name: 'schoolId', type: 'string' })
  @ApiOperation({ summary: 'Get current active subscription for a school' })
  @ApiOkResponse({ type: SubscriptionDto, description: 'Returns null if not found' })
  async getCurrent(@Param('schoolId') schoolId: string): Promise<SubscriptionDto | null> {
    return this.queryBus.execute(new GetCurrentSubscriptionQuery(schoolId));
  }

  @Get('subscriptions')
  @Roles(UserRole.ADMIN, UserRole.SCHOOL)
  @ApiParam({ name: 'schoolId', type: 'string' })
  @ApiOperation({ summary: 'List subscription history for a school' })
  @ApiOkResponse({ type: [SubscriptionDto] })
  async history(@Param('schoolId') schoolId: string): Promise<SubscriptionDto[]> {
    return this.queryBus.execute(new ListSubscriptionsQuery(schoolId));
  }

  @Get('plan-status')
  @Roles(UserRole.ADMIN, UserRole.SCHOOL)
  @ApiParam({ name: 'schoolId', type: 'string' })
  @ApiOperation({ summary: 'Get plan status and usage for a school' })
  @ApiOkResponse({ type: PlanStatusDto })
  async planStatus(@Param('schoolId') schoolId: string): Promise<PlanStatusDto> {
    return this.queryBus.execute(new GetPlanStatusQuery(schoolId));
  }
}
