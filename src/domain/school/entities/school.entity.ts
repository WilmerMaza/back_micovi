import { schoolCharacter } from './school-chacharacter.enum';
import { InstitutionType } from './institution-type.enum';
import { RepresentativeDocumentType } from './representative-document-type.enum';

export class School {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly userId: string,
    public readonly character: schoolCharacter,
    public readonly institutionType: InstitutionType | null,
    public readonly taxId: string | null,
    public readonly phone: string,
    public readonly address: string,
    public readonly country: string,
    public readonly state: string | null,
    public readonly city: string | null,
    public readonly headquarters: string | null,
    public readonly website: string | null,
    public readonly representativename: string | null,
    public readonly representativeDocumentType: RepresentativeDocumentType | null,
    public readonly logo: string | null,
    public readonly foundationDate: Date | null,
    public readonly latitude: number | null,
    public readonly longitude: number | null,
  ) {}
}
