import { schoolCharacter } from 'src/domain/school/entities/school-chacharacter.enum';
import { InstitutionType } from 'src/domain/school/entities/institution-type.enum';

export interface CategoryDescriptor {
  readonly name: string;
  readonly minAge?: number;
  readonly maxAge?: number;
}

export class RegisterSchoolCommand {
  constructor(
    public readonly name: string,
    public readonly address: string,
    public readonly phone: string,
    public readonly email: string,
    public readonly password: string,
    public readonly character: schoolCharacter,
    public readonly institutionType: InstitutionType,
    public readonly taxId: string,
    public readonly headquarters: string,
    public readonly country: string,
    public readonly state: string,
    public readonly city: string,
    public readonly website: string | null,
    public readonly representativename: string,
    public readonly disciplineIds: string[],
    public readonly categories: CategoryDescriptor[],
    public readonly logo: string | null,
    public readonly foundationDate: Date | null,
    public readonly latitude: number | null,
    public readonly longitude: number | null,
  ) {}
}
