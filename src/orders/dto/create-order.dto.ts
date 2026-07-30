export class CreateOrderItemDto {
  productId!: number;
  quantity!: number;
}

export class CreateOrderDto {
  userId!: number;
  items!: CreateOrderItemDto[];
}
