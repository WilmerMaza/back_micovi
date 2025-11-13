import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { LoginCommand } from 'src/application/auth/commands/login.command';
import { AuthenticatedUserDto } from 'src/application/auth/dto/authenticated-user.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly commandBus: CommandBus) {
    super({ usernameField: 'email', passwordField: 'password' });
  }

  async validate(email: string, password: string): Promise<AuthenticatedUserDto> {
    return this.commandBus.execute(new LoginCommand(email, password));
  }
}
