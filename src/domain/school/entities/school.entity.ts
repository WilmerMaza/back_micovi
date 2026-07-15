import { schoolCharacter } from './school-chacharacter.enum';
import { InstitutionType } from './institution-type.enum';

export class School {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly userId: string,
    public readonly character: schoolCharacter,
    public readonly institutionType: InstitutionType,
    public readonly taxId: string,
    public readonly phone: string,
    public readonly address: string,
    public readonly country: string,
    public readonly state: string,
    public readonly city: string,
    public readonly headquarters: string | null,
    public readonly website: string | null,
    public readonly representativename: string | null,
    public readonly logo: string | null,
    public readonly foundationDate: Date | null,
    public readonly latitude: number | null,
    public readonly longitude: number | null,
  ) {}
}
