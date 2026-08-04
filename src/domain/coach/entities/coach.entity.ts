export class Coach {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly specialty: string,
    public readonly userId: string,
    public readonly schoolId: string,
  ) {}
}
