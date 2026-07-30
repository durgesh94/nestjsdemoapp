import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { toUserResponse } from './mappers/user.mapper';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return toUserResponse(user);
  }

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(toUserResponse);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(+id);
    if (!user) {
      return { message: 'User not found' };
    }
    return toUserResponse(user);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const result = await this.usersService.update(+id, updateUserDto);
    if (!result.affected || result.affected === 0) {
      return { message: 'User not found' };
    }
    return { message: 'User updated successfully' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.usersService.remove(+id);
    if (!result.affected || result.affected === 0) {
      return { message: 'User not found' };
    }
    return { message: 'User removed successfully' };
  }
}
