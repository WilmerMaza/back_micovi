import { ApiProperty } from '@nestjs/swagger';
import { schoolCharacter } from 'src/domain/school/entities/school-chacharacter.enum';
import { InstitutionType } from 'src/domain/school/entities/institution-type.enum';
import { CategoryDto } from './category.dto';
import { SportDisciplineDto } from './sport-discipline.dto';

export class SchoolDto {
  @ApiProperty({ example: 'uuid-v4', description: 'Unique identifier for the institution' })
  id: string;

  @ApiProperty({ example: 'Escuela Deportiva Águilas', description: 'Institution name' })
  name: string;

  @ApiProperty({ example: 'Cra. 45 #23-90', description: 'Institution address' })
  address: string;

  @ApiProperty({ example: '+573001112233', description: 'Institution phone number' })
  phone: string;

  @ApiProperty({ example: 'uuid-v4', description: 'ID of the associated user account' })
  userId: string;

  @ApiProperty({ example: '901123456-7', description: 'Tax ID (NIT/RUC)' })
  taxId: string;

  @ApiProperty({
    enum: schoolCharacter,
    description: 'Character of the institution (PUBLIC/PRIVATE)',
  })
  character: schoolCharacter;

  @ApiProperty({ enum: InstitutionType, description: 'Type of sports institution' })
  institutionType: InstitutionType;

  @ApiProperty({ example: 'Colombia' })
  country: string;

  @ApiProperty({ example: 'Bolívar' })
  state: string;

  @ApiProperty({ example: 'Cartagena' })
  city: string;

  @ApiProperty({ example: 'Sede Principal', description: 'Headquarters', nullable: true })
  headquarters: string | null;

  @ApiProperty({
    example: 'https://academia.example.com',
    description: 'Official website',
    nullable: true,
  })
  website: string | null;

  @ApiProperty({ example: 'Juan Pérez', description: 'Legal representative name', nullable: true })
  representativename: string | null;

  @ApiProperty({ example: null, description: 'URL of the institution logo', nullable: true })
  logo: string | null;

  @ApiProperty({ example: null, description: 'Foundation date', nullable: true })
  foundationDate: Date | null;

  @ApiProperty({ example: null, description: 'Latitude coordinate', nullable: true })
  latitude: number | null;

  @ApiProperty({ example: null, description: 'Longitude coordinate', nullable: true })
  longitude: number | null;

  @ApiProperty({ type: [CategoryDto], description: 'Age categories of the institution' })
  categories: CategoryDto[];

  @ApiProperty({ type: [SportDisciplineDto], description: 'Associated sport disciplines' })
  disciplines: SportDisciplineDto[];

  constructor(
    id: string,
    name: string,
    address: string,
    phone: string,
    userId: string,
    taxId: string,
    character: schoolCharacter,
    institutionType: InstitutionType,
    country: string,
    state: string,
    city: string,
    headquarters: string | null,
    website: string | null,
    representativename: string | null,
    logo: string | null,
    foundationDate: Date | null,
    latitude: number | null,
    longitude: number | null,
    categories: CategoryDto[],
    disciplines: SportDisciplineDto[],
  ) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.phone = phone;
    this.userId = userId;
    this.taxId = taxId;
    this.character = character;
    this.institutionType = institutionType;
    this.country = country;
    this.state = state;
    this.city = city;
    this.headquarters = headquarters;
    this.website = website;
    this.representativename = representativename;
    this.logo = logo;
    this.foundationDate = foundationDate;
    this.latitude = latitude;
    this.longitude = longitude;
    this.categories = categories;
    this.disciplines = disciplines;
  }
}
