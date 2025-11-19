import { UserRole } from './user-role.enum';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly password: string,
    public readonly role: UserRole,
    public readonly country: string | null,
    public readonly state: string | null,
    public readonly city: string | null,
    public readonly phone: string | null,
    public readonly address: string | null,
  ) {}
}
