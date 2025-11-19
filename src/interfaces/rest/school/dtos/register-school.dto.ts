import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { schoolCharacter } from 'src/domain/school/entities/school-chacharacter.enum';

export class RegisterSchoolDto {
  @ApiProperty({
    example: 'Escuela Deportiva Águilas',
    description: 'Name of the sports school',
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    example: 'Cra. 45 #23-90',
    description: 'School physical address',
  })
  @IsString()
  @MinLength(5)
  address: string;

  @ApiProperty({
    example: '+573001112233',
    description: 'School contact phone number',
  })
  @IsString()
  @MinLength(7)
  phone: string;

  @ApiProperty({
    example: 'Colombia',
    description: 'Country where the school is located',
  })
  @IsString()
  @MinLength(3)
  country: string;

  @ApiProperty({
    example: 'Bolívar',
    description: 'State/region of the school',
  })
  @IsString()
  @MinLength(3)
  state: string;

  @ApiProperty({
    example: 'Cartagena',
    description: 'City where the school is located',
  })
  @IsString()
  @MinLength(3)
  city: string;

  @ApiProperty({
    example: 'PUBLIC',
    enum: schoolCharacter,
    description: 'Character of the school (e.g., PUBLIC or PRIVATE)',
  })
  @IsEnum(schoolCharacter)
  character: schoolCharacter;

  @ApiProperty({
    example: 'Sede Principal',
    description: 'Headquarters of the school',
  })
  @IsString()
  @MinLength(3)
  headquarters: string;

  @ApiProperty({
    example: 'https://www.escueladeportivaaguilas.com',
    description: 'Official website of the school',
  })
  @IsString()
  @MinLength(5)
  website: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Name of the school representative',
  })
  @IsString()
  @MinLength(3)
  representativename: string;

  @ApiProperty({
    example: 'escuela@correo.com',
    description: 'Email address for the admin user of the school',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'superSecret123',
    description: 'Password for the school admin user (minimum 8 characters)',
  })
  @IsString()
  @MinLength(8)
  password: string;
}
