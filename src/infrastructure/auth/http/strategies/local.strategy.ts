import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { LoginCommand } from 'src/application/auth/commands/login.command';
import { AuthenticatedUserDto } from 'src/application/auth/dto/authenticated-user.dto';
import { InvalidCredentialsException } from 'src/domain/auth/exceptions/invalid-credentials.exception';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly commandBus: CommandBus) {
    super({ usernameField: 'email', passwordField: 'password' });
  }

  async validate(email: string, password: string): Promise<AuthenticatedUserDto> {
    try {
      return await this.commandBus.execute(new LoginCommand(email, password));
    } catch (error) {
      if (error instanceof InvalidCredentialsException) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }
  }
}
