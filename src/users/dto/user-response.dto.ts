import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    example: 1,
  })
  id!: number;

  @ApiProperty({
    example: 'Durgesh Tambe',
  })
  name!: string;

  @ApiProperty({
    example: 'durgesh@gmail.com',
  })
  email!: string;

  @ApiProperty({
    example: 'CUSTOMER',
  })
  role!: string;
}
