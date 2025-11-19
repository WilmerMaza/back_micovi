import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PlanDto } from 'src/application/billing/dto/plan.dto';
import { CreatePlanCommand } from 'src/application/billing/plans/commands/create-plan.command';
import { DeletePlanCommand } from 'src/application/billing/plans/commands/delete-plan.command';
import { UpdatePlanCommand } from 'src/application/billing/plans/commands/update-plan.command';
import { GetPlanQuery } from 'src/application/billing/plans/queries/get-plan.query';
import { ListPlansQuery } from 'src/application/billing/plans/queries/list-plans.query';
import { PlanInUseException } from 'src/domain/billing/exceptions/plan-in-use.exception';
import { PlanNameAlreadyInUseException } from 'src/domain/billing/exceptions/plan-name-already-in-use.exception';
import { PlanNotFoundException } from 'src/domain/billing/exceptions/plan-not-found.exception';
import { UserRole } from 'src/domain/auth/entities/user-role.enum';
import { JwtAuthGuard } from 'src/infrastructure/auth/http/guard/jwt-auth.guard';
import { RolesGuard } from 'src/infrastructure/auth/http/guard/roles.guard';
import { Roles } from 'src/infrastructure/auth/http/decorators/roles.decorator';
import { CreatePlanDto } from '../dtos/create-plan.dto';
import { UpdatePlanDto } from '../dtos/update-plan.dto';

@ApiTags('Plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('plans')
export class PlanController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a subscription plan' })
  @ApiBody({ type: CreatePlanDto })
  @ApiCreatedResponse({ type: PlanDto })
  @ApiConflictResponse({ description: 'Plan name already in use' })
  async create(@Body() dto: CreatePlanDto): Promise<PlanDto> {
    try {
      return await this.commandBus.execute(
        new CreatePlanCommand(
          dto.name,
          dto.description,
          dto.price,
          dto.billingPeriodMonths,
          dto.maxCoaches,
          dto.maxAthletes,
        ),
      );
    } catch (error) {
      if (error instanceof PlanNameAlreadyInUseException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SCHOOL)
  @ApiOperation({ summary: 'List all available plans' })
  @ApiOkResponse({ type: [PlanDto] })
  async list(): Promise<PlanDto[]> {
    return this.queryBus.execute(new ListPlansQuery());
  }

  @Get(':planId')
  @Roles(UserRole.ADMIN, UserRole.SCHOOL)
  @ApiOperation({ summary: 'Get plan details' })
  @ApiParam({ name: 'planId', type: 'string' })
  @ApiOkResponse({ type: PlanDto })
  @ApiBadRequestResponse({ description: 'Plan not found' })
  async getById(@Param('planId') planId: string): Promise<PlanDto> {
    try {
      return await this.queryBus.execute(new GetPlanQuery(planId));
    } catch (error) {
      if (error instanceof PlanNotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Put(':planId')
  @Roles(UserRole.ADMIN)
  @ApiParam({ name: 'planId', type: 'string' })
  @ApiOperation({ summary: 'Update a plan' })
  @ApiOkResponse({ type: PlanDto })
  async update(@Param('planId') planId: string, @Body() dto: UpdatePlanDto): Promise<PlanDto> {
    try {
      return await this.commandBus.execute(
        new UpdatePlanCommand(
          planId,
          dto.name,
          dto.description,
          dto.price,
          dto.billingPeriodMonths,
          dto.maxCoaches,
          dto.maxAthletes,
          dto.isActive,
        ),
      );
    } catch (error) {
      if (error instanceof PlanNotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof PlanNameAlreadyInUseException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Delete(':planId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  @ApiParam({ name: 'planId', type: 'string' })
  @ApiOperation({ summary: 'Delete a plan' })
  @ApiNoContentResponse({ description: 'Plan removed' })
  async delete(@Param('planId') planId: string): Promise<void> {
    try {
      await this.commandBus.execute(new DeletePlanCommand(planId));
    } catch (error) {
      if (error instanceof PlanNotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof PlanInUseException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }
}
