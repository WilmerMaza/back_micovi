import { schoolCharacter } from 'src/domain/school/entities/school-chacharacter.enum';
import { InstitutionType } from 'src/domain/school/entities/institution-type.enum';
import { RepresentativeDocumentType } from 'src/domain/school/entities/representative-document-type.enum';

export interface CategoryDescriptor {
  readonly name: string;
  readonly minAge?: number;
  readonly maxAge?: number;
}

export class RegisterSchoolCommand {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
    public readonly character: schoolCharacter,
    public readonly institutionType: InstitutionType | null,
    public readonly taxId: string | null,
    public readonly headquarters: string | null,
    public readonly country: string,
    public readonly state: string | null,
    public readonly city: string | null,
    public readonly website: string | null,
    public readonly representativename: string,
    public readonly representativeDocumentType: RepresentativeDocumentType | null,
    public readonly disciplineIds: string[] | null,
    public readonly categories: CategoryDescriptor[] | null,
    public readonly logo: string | null,
    public readonly foundationDate: Date | null,
    public readonly latitude: number | null,
    public readonly longitude: number | null,
  ) {}
}
