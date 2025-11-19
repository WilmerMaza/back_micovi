import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUserDto } from 'src/application/auth/dto/authenticated-user.dto';
import { UserRole } from 'src/domain/auth/entities/user-role.enum';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUserDto;
};

@Injectable()
export class SchoolOwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      return false;
    }

    if (user.role === UserRole.ADMIN) {
      return true;
    }

    if (user.role !== UserRole.SCHOOL) {
      return false;
    }

    const paramSchoolId = request.params?.schoolId;
    if (!paramSchoolId || !user.schoolId) {
      return false;
    }

    return paramSchoolId === user.schoolId;
  }
}
