import { IsEmail, MinLength } from 'class-validator';

export class LoginAuthDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email!: string;

  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;
}
