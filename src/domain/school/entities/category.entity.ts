export class Category {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly schoolId: string,
    public readonly minAge: number | null,
    public readonly maxAge: number | null,
  ) {}
}
