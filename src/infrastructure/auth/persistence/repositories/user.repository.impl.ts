import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';
import { UserRole } from 'src/domain/auth/entities/user-role.enum';
import { User } from 'src/domain/auth/entities/user.entity';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    return record ? this.toDomain(record) : null;
  }

  async create(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        password: user.password,
        role: user.role,
      },
    });
    return this.toDomain(created);
  }

  private toDomain(record: PrismaUser): User {
    return new User(record.id, record.email, record.password, record.role as UserRole);
  }
}
