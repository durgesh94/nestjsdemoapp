import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/orderItem.entity';
import { Product } from '../products/entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { OrderStatus } from './enums/order-status.enum';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: any;
  let orderItemRepository: any;
  let productRepository: any;

  const mockProduct = {
    id: 1,
    name: 'Test Product',
    price: 100,
    description: 'Test Description',
  };

  const mockOrderItem = {
    id: 1,
    productId: 1,
    quantity: 2,
    price: 100,
    product: mockProduct,
  };

  const mockOrder = {
    id: 1,
    userId: 1,
    status: OrderStatus.PENDING,
    totalAmount: 200,
    items: [mockOrderItem],
    user: { id: 1, name: 'John Doe', email: 'john@example.com' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrderRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockOrderItemRepository = {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockProductRepository = {
    findBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockOrderItemRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    orderRepository = module.get(getRepositoryToken(Order));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    orderItemRepository = module.get(getRepositoryToken(OrderItem));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    productRepository = module.get(getRepositoryToken(Product));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should create an order successfully', async () => {
      const createOrderDto = {
        userId: 1,
        items: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 1 },
        ],
      };

      const mockProducts = [
        { id: 1, price: 100 },
        { id: 2, price: 50 },
      ];

      productRepository.findBy.mockResolvedValue(mockProducts);
      orderItemRepository.create.mockImplementation((dto) => dto);
      orderRepository.create.mockReturnValue(mockOrder);
      orderRepository.save.mockResolvedValue(mockOrder);

      const result = await service.create(createOrderDto);

      expect(productRepository.findBy).toHaveBeenCalled();
      expect(orderRepository.create).toHaveBeenCalled();
      expect(orderRepository.save).toHaveBeenCalledWith(mockOrder);
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if product not found', async () => {
      const createOrderDto = {
        userId: 1,
        items: [{ productId: 999, quantity: 2 }],
      };

      productRepository.findBy.mockResolvedValue([]);
      orderItemRepository.create.mockImplementation((dto) => dto);

      await expect(service.create(createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should calculate total amount correctly', async () => {
      const createOrderDto = {
        userId: 1,
        items: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 3 },
        ],
      };

      const mockProducts = [
        { id: 1, price: 100 },
        { id: 2, price: 50 },
      ];

      productRepository.findBy.mockResolvedValue(mockProducts);
      orderItemRepository.create.mockImplementation((dto) => dto);
      orderRepository.create.mockReturnValue(mockOrder);
      orderRepository.save.mockResolvedValue(mockOrder);

      const result = await service.create(createOrderDto);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const createdOrder = orderRepository.create.mock.calls[0][0];
      expect(createdOrder.totalAmount).toBe(350); // (100*2) + (50*3)
      expect(result).toEqual(mockOrder);
    });
  });

  describe('findAll()', () => {
    it('should return all orders with relations', async () => {
      const mockOrders = [mockOrder];

      orderRepository.find.mockResolvedValue(mockOrders);

      const result = await service.findAll();

      expect(orderRepository.find).toHaveBeenCalledWith({
        relations: { user: true, items: { product: true } },
      });
      expect(result).toEqual(mockOrders);
    });

    it('should return empty array if no orders exist', async () => {
      orderRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne()', () => {
    it('should return a single order by id', async () => {
      orderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.findOne(1);

      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { user: true, items: { product: true } },
      });
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if order not found', async () => {
      orderRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('should update order with new items', async () => {
      const updateOrderDto = {
        items: [{ productId: 2, quantity: 1 }],
      };

      const mockNewProduct = { id: 2, price: 75 };

      orderRepository.findOne.mockResolvedValue(mockOrder);
      orderItemRepository.delete.mockResolvedValue({ affected: 1 });
      productRepository.findBy.mockResolvedValue([mockNewProduct]);
      orderItemRepository.create.mockImplementation((dto) => dto);
      orderRepository.save.mockResolvedValue({
        ...mockOrder,
        items: [{ productId: 2, quantity: 1, price: 75 }],
        totalAmount: 75,
      });

      const result = await service.update(1, updateOrderDto);

      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { user: true, items: { product: true } },
      });
      expect(orderItemRepository.delete).toHaveBeenCalledWith({
        orderId: 1,
      });
      expect(orderRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should update order with new userId', async () => {
      const updateOrderDto = {
        userId: 2,
      };

      orderRepository.findOne.mockResolvedValue(mockOrder);
      orderRepository.save.mockResolvedValue({
        ...mockOrder,
        userId: 2,
      });

      const result = await service.update(1, updateOrderDto);

      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { user: true, items: { product: true } },
      });
      expect(orderRepository.save).toHaveBeenCalled();
      expect(result.userId).toBe(2);
    });

    it('should throw NotFoundException if order not found during update', async () => {
      const updateOrderDto = {
        userId: 2,
      };

      orderRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if product not found during items update', async () => {
      const updateOrderDto = {
        items: [{ productId: 999, quantity: 1 }],
      };

      orderRepository.findOne.mockResolvedValue(mockOrder);
      orderItemRepository.delete.mockResolvedValue({ affected: 1 });
      productRepository.findBy.mockResolvedValue([]);

      await expect(service.update(1, updateOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove()', () => {
    it('should remove an order', async () => {
      orderRepository.findOne.mockResolvedValue(mockOrder);
      orderRepository.remove.mockResolvedValue(mockOrder);

      const result = await service.remove(1);

      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { user: true, items: { product: true } },
      });
      expect(orderRepository.remove).toHaveBeenCalledWith(mockOrder);
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if order not found during remove', async () => {
      orderRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus()', () => {
    it('should update order status', async () => {
      orderRepository.findOne.mockResolvedValue(mockOrder);
      orderRepository.save.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CONFIRMED,
      });

      const result = await service.updateStatus(1, OrderStatus.CONFIRMED);

      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { user: true, items: { product: true } },
      });
      expect(orderRepository.save).toHaveBeenCalled();
      expect(result.status).toBe(OrderStatus.CONFIRMED);
    });

    it('should throw NotFoundException if order not found during status update', async () => {
      orderRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus(999, OrderStatus.SHIPPED),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update to different order statuses', async () => {
      const statuses = [
        OrderStatus.PENDING,
        OrderStatus.CONFIRMED,
        OrderStatus.PACKED,
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
      ];

      for (const status of statuses) {
        orderRepository.findOne.mockResolvedValue(mockOrder);
        orderRepository.save.mockResolvedValue({
          ...mockOrder,
          status,
        });

        const result = await service.updateStatus(1, status);

        expect(result.status).toBe(status);
      }
    });
  });
});
