import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterSchoolDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(5)
  address: string;

  @IsString()
  @MinLength(7)
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
