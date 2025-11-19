import { schoolCharacter } from './school-chacharacter.enum';

export class School {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly userId: string,
    public readonly character: schoolCharacter,
    public readonly headquarters: string | null,
    public readonly website: string | null,
    public readonly representativename: string | null,
  ) {}
}
