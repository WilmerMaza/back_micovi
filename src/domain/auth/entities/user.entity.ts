import { UserRole } from './user-role.enum';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly password: string,
    public readonly role: UserRole,
  ) {}
}
