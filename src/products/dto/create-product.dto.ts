import { IsString, MinLength, IsNumber, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name!: string;

  @IsString()
  @MinLength(5, { message: 'Description must be at least 5 characters long' })
  description!: string;

  @IsNumber()
  @Min(1, { message: 'Price must be greater than 0' })
  price!: number;
}
