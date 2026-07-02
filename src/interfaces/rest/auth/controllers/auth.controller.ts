/**
 * Controlador REST de autenticación (adaptador primario).
 *
 * Orquesta login, refresh, logout y consulta de sesión. No contiene lógica
 * de negocio: delega en SessionAuthService, CookieAuthService y CQRS.
 *
 * Contrato con el frontend:
 * - Nunca devuelve tokens en el body JSON
 * - Set-Cookie en login/refresh
 * - Perfil de usuario: { id, email, role, schoolId }
 *
 * Rutas bajo prefijo global /api → /api/auth/*
 */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthenticatedUserDto } from 'src/application/auth/dto/authenticated-user.dto';
import { GetMeQuery } from 'src/application/auth/queries/get-me.query';
import { COOKIE_NAMES } from 'src/infrastructure/config/cookie.config';
import { CookieAuthService } from 'src/infrastructure/auth/services/cookie-auth.service';
import { SessionAuthService } from 'src/infrastructure/auth/services/session-auth.service';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import { SchoolRepository } from 'src/domain/school/repositories/school.repository';
import { UserRole } from 'src/domain/auth/entities/user-role.enum';
import { CsrfGuard } from 'src/infrastructure/auth/http/guard/csrf.guard';
import { JwtAuthGuard } from 'src/infrastructure/auth/http/guard/jwt-auth.guard';
import { LocalAuthGuard } from 'src/infrastructure/auth/http/guard/local-auth.guard';
import { RolesGuard } from 'src/infrastructure/auth/http/guard/roles.guard';
import { Roles } from 'src/infrastructure/auth/http/decorators/roles.decorator';
import { LoginDto } from '../dtos/login.dto';
import { MeResponseDto } from '../dtos/me-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly cookieAuthService: CookieAuthService,
    private readonly sessionAuthService: SessionAuthService,
    private readonly userRepository: UserRepository,
    private readonly schoolRepository: SchoolRepository,
  ) {}

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login with email and password (sets HttpOnly cookies)' })
  @ApiBody({ type: LoginDto })
  @ApiCreatedResponse({ description: 'Authenticated user profile', type: MeResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(
    @Body() _dto: LoginDto,
    @Req() req: Request & { user: AuthenticatedUserDto },
    @Res({ passthrough: true }) res: Response,
  ): Promise<MeResponseDto> {
    const user = req.user;
    const sessionResult = await this.sessionAuthService.createSession(user, {
      userAgent: req.header('user-agent') ?? undefined,
      ipAddress: req.ip,
    });

    this.cookieAuthService.setAuthCookies(
      res,
      sessionResult.accessToken,
      sessionResult.refreshToken,
    );

    return this.toMeResponse(user);
  }

  @Post('refresh')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Rotate access/refresh tokens using HttpOnly refresh cookie' })
  @ApiOkResponse({ description: 'Session refreshed', type: MeResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MeResponseDto> {
    const refreshToken = req.cookies?.[COOKIE_NAMES.refreshToken] as string | undefined;
    if (!refreshToken) {
      this.cookieAuthService.clearAuthCookies(res);
      throw new UnauthorizedException('Missing refresh token');
    }

    const refreshed = await this.sessionAuthService.refreshSession(
      refreshToken,
      {
        userAgent: req.header('user-agent') ?? undefined,
        ipAddress: req.ip,
      },
      async (userId) => {
        const user = await this.userRepository.findById(userId);
        if (!user) return null;

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
      },
    );

    this.cookieAuthService.rotateAuthCookies(res, refreshed.accessToken, refreshed.refreshToken);

    const user = await this.queryBus.execute<GetMeQuery, AuthenticatedUserDto>(
      new GetMeQuery(refreshed.session.userId),
    );
    return this.toMeResponse(user);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard, CsrfGuard)
  @ApiCookieAuth('micovi_access')
  @ApiOperation({ summary: 'Logout and revoke current session' })
  @ApiOkResponse({ description: 'Logged out successfully' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true }> {
    const refreshToken = req.cookies?.[COOKIE_NAMES.refreshToken] as string | undefined;
    if (refreshToken) {
      await this.sessionAuthService.revokeSession(refreshToken);
    }

    this.cookieAuthService.clearAuthCookies(res);
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('micovi_access')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiOkResponse({ type: MeResponseDto })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  me(@Req() req: Request & { user: AuthenticatedUserDto }): MeResponseDto {
    return this.toMeResponse(req.user);
  }

  @Get('session')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('micovi_access')
  @ApiOperation({ summary: 'Alias of /auth/me for session bootstrap' })
  @ApiOkResponse({ type: MeResponseDto })
  session(@Req() req: Request & { user: AuthenticatedUserDto }): MeResponseDto {
    return this.toMeResponse(req.user);
  }

  @Post('sessions/:userId/revoke-all')
  @UseGuards(JwtAuthGuard, RolesGuard, CsrfGuard)
  @Roles(UserRole.ADMIN)
  @ApiCookieAuth('micovi_access')
  @ApiOperation({ summary: 'Revoke all active sessions for a user (admin only)' })
  @ApiOkResponse({ description: 'All sessions revoked' })
  async revokeAllSessions(@Param('userId') userId: string): Promise<{ revoked: true }> {
    await this.sessionAuthService.revokeAllUserSessions(userId);
    return { revoked: true };
  }

  private toMeResponse(user: AuthenticatedUserDto): MeResponseDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId ?? null,
    };
  }
}
