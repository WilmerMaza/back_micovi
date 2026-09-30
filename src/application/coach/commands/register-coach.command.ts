export class RegisterCoachCommand {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
    public readonly specialty: string,
    public readonly schoolId: string,
    public readonly phone?: string,
    public readonly country?: string,
    public readonly state?: string,
    public readonly city?: string,
  ) {}
}
