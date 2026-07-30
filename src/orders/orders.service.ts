import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from './enums/order-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/orderItem.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { items, ...orderData } = createOrderDto;

    const productIds = items.map((item) => item.productId);
    const products = await this.productRepository.findBy({
      id: In(productIds),
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundException(`Product #${item.productId} not found`);
      }
      return this.orderItemRepository.create({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    const order = this.orderRepository.create({
      ...orderData,
      totalAmount,
      items: orderItems,
    });

    return this.orderRepository.save(order);
  }

  findAll() {
    return this.orderRepository.find({
      relations: { user: true, items: { product: true } },
    });
  }

  async findOne(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { user: true, items: { product: true } },
    });

    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOne(id);

    if (updateOrderDto.items) {
      await this.orderItemRepository.delete({ orderId: id });

      const productIds = updateOrderDto.items.map((item) => item.productId);
      const products = await this.productRepository.findBy({
        id: In(productIds),
      });
      const productMap = new Map(products.map((p) => [p.id, p]));

      order.items = updateOrderDto.items.map((item) => {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new NotFoundException(`Product #${item.productId} not found`);
        }
        return this.orderItemRepository.create({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });
      });

      order.totalAmount = order.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0,
      );
    }

    if (updateOrderDto.userId) {
      order.userId = updateOrderDto.userId;
    }

    return this.orderRepository.save(order);
  }

  async remove(id: number) {
    const order = await this.findOne(id);
    return this.orderRepository.remove(order);
  }

  async updateStatus(id: number, status: string) {
    const order = await this.findOne(id);
    order.status = status as OrderStatus; // Cast to OrderStatus enum
    return this.orderRepository.save(order);
  }
}
