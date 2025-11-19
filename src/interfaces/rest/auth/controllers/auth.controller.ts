import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthenticatedUserDto } from 'src/application/auth/dto/authenticated-user.dto';
import { LocalAuthGuard } from 'src/infrastructure/auth/http/guard/local-auth.guard';
import { LoginDto } from '../dtos/login.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { AuthService } from 'src/infrastructure/auth/services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiCreatedResponse({
    description: 'User authenticated successfully',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input or validation error' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() _dto: LoginDto, @Req() req: { user: AuthenticatedUserDto }): LoginResponseDto {
    const accessToken = this.authService.generateAccessToken(req.user);
    return {
      user: req.user,
      accessToken,
    };
  }
}
