import { Controller, Post, Body, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { toUserResponse } from 'src/users/mappers/user.mapper';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() registerAuthDto: RegisterAuthDto) {
    const user = await this.authService.register(registerAuthDto);
    return toUserResponse(user);
  }

  @Post('/login')
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Patch('/updatePassword')
  updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
    return this.authService.updatePassword(updatePasswordDto);
  }
}
