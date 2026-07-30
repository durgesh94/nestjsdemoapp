import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  name!: string;

  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  password!: string;
}
