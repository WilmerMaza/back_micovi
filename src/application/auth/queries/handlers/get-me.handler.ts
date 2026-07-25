/**
 * Caso de uso: obtener perfil del usuario autenticado (GET /auth/me).
 *
 * Reconstruye AuthenticatedUserDto desde BD (no confía solo en el JWT)
 * para tener datos actualizados. Resuelve schoolId si el rol es SCHOOL.
 */
import { UnauthorizedException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AuthenticatedUserDto } from '../../dto/authenticated-user.dto';
import { GetMeQuery } from '../get-me.query';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import { SchoolRepository } from 'src/domain/school/repositories/school.repository';
import { UserRole } from 'src/domain/auth/entities/user-role.enum';

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery, AuthenticatedUserDto> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly schoolRepository: SchoolRepository,
  ) {}

  async execute(query: GetMeQuery): Promise<AuthenticatedUserDto> {
    const user = await this.userRepository.findById(query.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    let schoolId: string | null = null;
    if (user.role === UserRole.SCHOOL) {
      const school = await this.schoolRepository.findByUserId(user.id);
      schoolId = school?.id ?? null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      schoolId,
    };
  }
}
