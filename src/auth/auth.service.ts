import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerAuthDto: RegisterAuthDto) {
    const userExists = await this.usersService.findByEmail(
      registerAuthDto.email,
    );

    if (userExists) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerAuthDto.password, 10);

    return this.usersService.create({
      ...registerAuthDto,
      password: hashedPassword,
    });
  }

  async login(loginAuthDto: any) {
    const user = await this.usersService.findByEmail(loginAuthDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(loginAuthDto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  updatePassword(updatePasswordDto: UpdatePasswordDto) {
    console.log(updatePasswordDto);
    return `This action updates the password for user #${updatePasswordDto.currentPassword}`;
  }
}
