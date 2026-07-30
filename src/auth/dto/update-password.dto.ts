import { MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @MinLength(8, {
    message: 'Current password must be at least 8 characters long',
  })
  currentPassword!: string;

  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  newPassword!: string;
}
