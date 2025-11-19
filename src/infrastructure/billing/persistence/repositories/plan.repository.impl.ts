import { Inject, Injectable } from '@nestjs/common';
import { Plan as PrismaPlan, Prisma, PrismaClient } from '@prisma/client';
import { Plan } from 'src/domain/billing/entities/plan.entity';
import { PlanRepository } from 'src/domain/billing/repositories/plan.repository';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

@Injectable()
export class PrismaPlanRepository implements PlanRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClientLike) {}

  async create(plan: Plan): Promise<Plan> {
    const created = await this.prisma.plan.create({
      data: this.toPersistence(plan),
    });
    return this.toDomain(created);
  }

  async update(plan: Plan): Promise<Plan> {
    const updated = await this.prisma.plan.update({
      where: { id: plan.id },
      data: {
        description: plan.description,
        name: plan.name,
        price: plan.price,
        billingPeriodMonths: plan.billingPeriodMonths,
        maxCoaches: plan.maxCoaches ?? null,
        maxAthletes: plan.maxAthletes ?? null,
        isActive: plan.isActive,
      },
    });
    return this.toDomain(updated);
  }

  async findById(id: string): Promise<Plan | null> {
    const record = await this.prisma.plan.findFirst({
      where: { id, deletedAt: null },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByName(name: string): Promise<Plan | null> {
    const record = await this.prisma.plan.findFirst({
      where: { name, deletedAt: null },
    });
    return record ? this.toDomain(record) : null;
  }

  async findAll(): Promise<Plan[]> {
    const records = await this.prisma.plan.findMany({
      where: { deletedAt: null },
      orderBy: { price: 'asc' },
    });
    return records.map((record) => this.toDomain(record));
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.plan.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  private toDomain(record: PrismaPlan): Plan {
    return new Plan(
      record.id,
      record.name,
      record.description,
      record.price,
      record.billingPeriodMonths,
      record.maxCoaches,
      record.maxAthletes,
      record.isActive,
      record.createdAt,
      record.updatedAt,
    );
  }

  private toPersistence(plan: Plan): Prisma.PlanCreateInput {
    return {
      id: plan.id,
      description: plan.description,
      name: plan.name,
      price: plan.price,
      billingPeriodMonths: plan.billingPeriodMonths,
      maxCoaches: plan.maxCoaches ?? null,
      maxAthletes: plan.maxAthletes ?? null,
      isActive: plan.isActive,
    };
  }
}
