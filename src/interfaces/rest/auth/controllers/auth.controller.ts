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

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiCreatedResponse({
    description: 'User authenticated successfully',
    type: AuthenticatedUserDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input or validation error' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() _dto: LoginDto, @Req() req: { user: AuthenticatedUserDto }): AuthenticatedUserDto {
    return req.user;
  }
}
