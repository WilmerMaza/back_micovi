/**
 * Estrategia Passport JWT — extrae el access token desde cookie HttpOnly.
 *
 * ¿Por qué no Bearer header?
 * Los tokens no deben estar en localStorage ni ser manejados por JavaScript.
 * La cookie micovi_access viaja automáticamente con withCredentials: true.
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUserDto } from 'src/application/auth/dto/authenticated-user.dto';
import { COOKIE_NAMES } from 'src/infrastructure/config/cookie.config';
import { JwtPayload } from '../../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => (req?.cookies?.[COOKIE_NAMES.accessToken] as string | undefined) ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): AuthenticatedUserDto {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      schoolId: payload.schoolId ?? null,
    };
  }
}
