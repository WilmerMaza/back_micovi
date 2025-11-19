import { Inject, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient, User as PrismaUser } from '@prisma/client';
import { UserRole } from 'src/domain/auth/entities/user-role.enum';
import { User } from 'src/domain/auth/entities/user.entity';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';
import { EmailAlreadyInUseException } from 'src/domain/auth/exceptions/email-already-in-use.exception';

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClientLike) {}

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    return record ? this.toDomain(record) : null;
  }

  async create(user: User): Promise<User> {
    try {
      const created = await this.prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          password: user.password,
          role: user.role,
          country: user.country ?? undefined,
          state: user.state ?? undefined,
          city: user.city ?? undefined,
          phone: user.phone ?? undefined,
          address: user.address ?? undefined,
        },
      });
      return this.toDomain(created);
    } catch (error) {
      const target = (error as Prisma.PrismaClientKnownRequestError)?.meta?.target;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        (Array.isArray(target) ? target.includes('email') : target === 'email')
      ) {
        throw new EmailAlreadyInUseException(user.email);
      }
      throw error;
    }
  }

  private toDomain(record: PrismaUser): User {
    return new User(
      record.id,
      record.email,
      record.password,
      record.role as UserRole,
      record.country,
      record.state,
      record.city,
      record.phone,
      record.address,
    );
  }
}
