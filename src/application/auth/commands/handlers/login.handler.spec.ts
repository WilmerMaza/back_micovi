import { LoginHandler } from './login.handler';
import { LoginCommand } from '../login.command';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import { PasswordHasher } from 'src/domain/auth/services/password-hasher.service';
import { User } from 'src/domain/auth/entities/user.entity';
import { UserRole } from 'src/domain/auth/entities/user-role.enum';
import { InvalidCredentialsException } from 'src/domain/auth/exceptions/invalid-credentials.exception';

describe('LoginHandler', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let handler: LoginHandler;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    handler = new LoginHandler(userRepository, passwordHasher);
  });

  it('returns the authenticated user DTO when credentials are valid', async () => {
    const user = new User('user-1', 'team@example.com', 'hashed-password', UserRole.SCHOOL);
    userRepository.findByEmail.mockResolvedValue(user);
    passwordHasher.compare.mockResolvedValue(true);

    const result = await handler.execute(new LoginCommand(user.email, 'Secret123'));

    expect(result).toEqual({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    expect(passwordHasher.compare).toHaveBeenCalledWith('Secret123', 'hashed-password');
  });

  it('throws InvalidCredentialsException when user is not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      handler.execute(new LoginCommand('missing@example.com', 'Secret123')),
    ).rejects.toBeInstanceOf(InvalidCredentialsException);

    expect(passwordHasher.compare).not.toHaveBeenCalled();
  });

  it('throws InvalidCredentialsException when password is invalid', async () => {
    const user = new User('user-1', 'team@example.com', 'hashed-password', UserRole.SCHOOL);
    userRepository.findByEmail.mockResolvedValue(user);
    passwordHasher.compare.mockResolvedValue(false);

    await expect(
      handler.execute(new LoginCommand(user.email, 'bad-password')),
    ).rejects.toBeInstanceOf(InvalidCredentialsException);
  });
});
