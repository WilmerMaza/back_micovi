import { schoolCharacter } from 'src/domain/school/entities/school-chacharacter.enum';

export class RegisterSchoolCommand {
  constructor(
    public readonly name: string,
    public readonly address: string,
    public readonly phone: string,
    public readonly email: string,
    public readonly password: string,
    public readonly character: schoolCharacter,
    public readonly headquarters: string,
    public readonly country: string,
    public readonly state: string,
    public readonly city: string,
    public readonly website: string,
    public readonly representativename: string,
  ) {}
}
