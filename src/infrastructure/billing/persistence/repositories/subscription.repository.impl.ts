import { Inject, Injectable } from '@nestjs/common';
import {
  Plan as PrismaPlan,
  Prisma,
  PrismaClient,
  SchoolPlan as PrismaSchoolPlan,
  SubscriptionStatus as PrismaSubscriptionStatus,
} from '@prisma/client';
import { Plan } from 'src/domain/billing/entities/plan.entity';
import { SchoolSubscription } from 'src/domain/billing/entities/school-subscription.entity';
import { SubscriptionStatus } from 'src/domain/billing/entities/subscription-status.enum';
import {
  SubscriptionRepository,
  UsageMetrics,
} from 'src/domain/billing/repositories/subscription.repository';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

@Injectable()
export class PrismaSubscriptionRepository implements SubscriptionRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClientLike) {}

  async create(subscription: SchoolSubscription): Promise<SchoolSubscription> {
    const created = await this.prisma.schoolPlan.create({
      data: this.toPersistence(subscription),
      include: { plan: true },
    });
    return this.toDomain(created);
  }

  async update(subscription: SchoolSubscription): Promise<SchoolSubscription> {
    const updated = await this.prisma.schoolPlan.update({
      where: { id: subscription.id },
      data: {
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        status: subscription.status,
        canceledAt: subscription.canceledAt,
      },
      include: { plan: true },
    });
    return this.toDomain(updated);
  }

  async findById(id: string): Promise<SchoolSubscription | null> {
    const record = await this.prisma.schoolPlan.findFirst({
      where: { id, deletedAt: null },
      include: { plan: true },
    });
    return record ? this.toDomain(record) : null;
  }

  async findCurrentBySchoolId(
    schoolId: string,
    referenceDate: Date,
  ): Promise<SchoolSubscription | null> {
    const record = await this.prisma.schoolPlan.findFirst({
      where: {
        schoolId,
        deletedAt: null,
        status: SubscriptionStatus.ACTIVE,
        startDate: { lte: referenceDate },
        endDate: { gte: referenceDate },
      },
      include: { plan: true },
      orderBy: { startDate: 'desc' },
    });
    return record ? this.toDomain(record) : null;
  }

  async findHistoryBySchoolId(schoolId: string): Promise<SchoolSubscription[]> {
    const records = await this.prisma.schoolPlan.findMany({
      where: { schoolId, deletedAt: null },
      include: { plan: true },
      orderBy: { startDate: 'desc' },
    });
    return records.map((record) => this.toDomain(record));
  }

  async countActiveSubscriptionsByPlan(planId: string, referenceDate: Date): Promise<number> {
    return this.prisma.schoolPlan.count({
      where: {
        planId,
        deletedAt: null,
        status: SubscriptionStatus.ACTIVE,
        startDate: { lte: referenceDate },
        endDate: { gte: referenceDate },
      },
    });
  }

  async getUsageMetrics(schoolId: string): Promise<UsageMetrics> {
    const [coaches, athletes] = await Promise.all([
      this.prisma.coach.count({
        where: { schoolId, deletedAt: null },
      }),
      this.prisma.athlete.count({
        where: {
          deletedAt: null,
          coach: { schoolId, deletedAt: null },
        },
      }),
    ]);
    return { coaches, athletes };
  }

  private toDomain(record: PrismaSchoolPlan & { plan?: PrismaPlan | null }): SchoolSubscription {
    const plan = record.plan
      ? new Plan(
          record.plan.id,
          record.plan.name,
          record.plan.description,
          record.plan.price,
          record.plan.billingPeriodMonths,
          record.plan.maxCoaches,
          record.plan.maxAthletes,
          record.plan.isActive,
          record.plan.createdAt,
          record.plan.updatedAt,
        )
      : undefined;

    return new SchoolSubscription(
      record.id,
      record.schoolId,
      record.planId,
      record.startDate,
      record.endDate,
      record.status as SubscriptionStatus,
      record.createdAt,
      record.updatedAt,
      record.canceledAt,
      plan,
    );
  }

  private toPersistence(subscription: SchoolSubscription): Prisma.SchoolPlanCreateInput {
    return {
      id: subscription.id,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      status: subscription.status as PrismaSubscriptionStatus,
      canceledAt: subscription.canceledAt,
      school: { connect: { id: subscription.schoolId } },
      plan: { connect: { id: subscription.planId } },
    };
  }
}
