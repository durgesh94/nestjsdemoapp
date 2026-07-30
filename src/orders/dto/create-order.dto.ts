import { IsInt, Min, MinLength } from 'class-validator';

export class CreateOrderItemDto {
  @IsInt()
  @Min(1, { message: 'Product ID must be a positive integer' })
  productId!: number;

  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity!: number;
}

export class CreateOrderDto {
  @IsInt()
  @Min(1, { message: 'User ID must be a positive integer' })
  userId!: number;

  @MinLength(1, { message: 'Order must contain at least one item' })
  items!: CreateOrderItemDto[];
}
