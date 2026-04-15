import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsString()
  @IsOptional()
  @MaxLength(80, { message: 'Name must not exceed 80 characters' })
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(40, { message: 'First name must not exceed 40 characters' })
  firstname?: string;

  @IsString()
  @IsOptional()
  @MaxLength(40, { message: 'Last name must not exceed 40 characters' })
  lastname?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
