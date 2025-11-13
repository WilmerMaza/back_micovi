import { Module } from '@nestjs/common';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import { SchoolRepository } from 'src/domain/school/repositories/school.repository';
import { PrismaUserRepository } from 'src/infrastructure/auth/persistence/repositories/user.repository.impl';
import { PrismaSchoolRepository } from 'src/infrastructure/school/persistence/repositories/school.repository.impl';
import { PrismaService } from './prisma.service';

@Module({
  providers: [
    PrismaService,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: SchoolRepository,
      useClass: PrismaSchoolRepository,
    },
  ],
  exports: [PrismaService, UserRepository, SchoolRepository],
})
export class PersistenceModule {}
