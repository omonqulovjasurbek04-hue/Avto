import { IsString, IsEmail, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, { message: "Telefon raqami noto'g'ri formatda" })
  phone?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
