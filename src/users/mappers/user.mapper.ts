import { UserResponseDto } from '../dto/user-response.dto';
import { User } from '../entities/user.entity';

export const toUserResponse = (user: User): UserResponseDto => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};
