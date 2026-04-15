import { IsString, IsEmail, IsOptional, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsString({ message: 'First name must be a string' })
  @IsOptional()
  @MaxLength(40, { message: 'First name must not exceed 40 characters' })
  firstname?: string;

  @IsString({ message: 'Last name must be a string' })
  @IsOptional()
  @MaxLength(40, { message: 'Last name must not exceed 40 characters' })
  lastname?: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  @MaxLength(40, { message: 'Email must not exceed 40 characters' })
  email?: string;

  @IsString({ message: 'Mobile must be a string' })
  @IsOptional()
  @MaxLength(40, { message: 'Mobile must not exceed 40 characters' })
  mobile?: string;

  @IsString({ message: 'Dial code must be a string' })
  @IsOptional()
  @MaxLength(40, { message: 'Dial code must not exceed 40 characters' })
  dialCode?: string;

  @IsString({ message: 'Country name must be a string' })
  @IsOptional()
  @MaxLength(255, { message: 'Country name must not exceed 255 characters' })
  countryName?: string;

  @IsString({ message: 'City must be a string' })
  @IsOptional()
  @MaxLength(255, { message: 'City must not exceed 255 characters' })
  city?: string;

  @IsString({ message: 'State must be a string' })
  @IsOptional()
  @MaxLength(255, { message: 'State must not exceed 255 characters' })
  state?: string;

  @IsString({ message: 'ZIP must be a string' })
  @IsOptional()
  @MaxLength(255, { message: 'ZIP must not exceed 255 characters' })
  zip?: string;

  @IsString({ message: 'Address must be a string' })
  @IsOptional()
  address?: string;
}
