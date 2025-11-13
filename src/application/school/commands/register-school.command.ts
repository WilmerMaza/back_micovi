export class RegisterSchoolCommand {
  constructor(
    public readonly name: string,
    public readonly address: string,
    public readonly phone: string,
    public readonly email: string,
    public readonly password: string,
  ) {}
}
