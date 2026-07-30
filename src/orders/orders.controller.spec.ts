import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderStatus } from './enums/order-status.enum';
import { NotFoundException } from '@nestjs/common';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: any;

  const mockOrder = {
    id: 1,
    userId: 1,
    status: OrderStatus.PENDING,
    totalAmount: 200,
    items: [
      {
        id: 1,
        productId: 1,
        quantity: 2,
        price: 100,
        product: { id: 1, name: 'Product 1', price: 100 },
      },
    ],
    user: { id: 1, name: 'John Doe', email: 'john@example.com' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrdersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    ordersService = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should create an order', async () => {
      const createOrderDto = {
        userId: 1,
        items: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 1 },
        ],
      };

      jest.spyOn(ordersService, 'create').mockResolvedValue(mockOrder);

      const result = await controller.create(createOrderDto);

      expect(ordersService.create).toHaveBeenCalledWith(createOrderDto);
      expect(result).toEqual(mockOrder);
    });

    it('should handle creation errors', async () => {
      const createOrderDto = {
        userId: 1,
        items: [{ productId: 999, quantity: 1 }],
      };

      jest
        .spyOn(ordersService, 'create')
        .mockRejectedValue(new NotFoundException('Product not found'));

      await expect(controller.create(createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll()', () => {
    it('should return all orders', async () => {
      const mockOrders = [
        mockOrder,
        {
          ...mockOrder,
          id: 2,
          userId: 2,
        },
      ];

      jest.spyOn(ordersService, 'findAll').mockResolvedValue(mockOrders);

      const result = await controller.findAll();

      expect(ordersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockOrders);
      expect(result).toHaveLength(2);
    });

    it('should return empty array if no orders exist', async () => {
      jest.spyOn(ordersService, 'findAll').mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne()', () => {
    it('should return a single order by id', async () => {
      jest.spyOn(ordersService, 'findOne').mockResolvedValue(mockOrder);

      const result = await controller.findOne('1');

      expect(ordersService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockOrder);
    });

    it('should convert string id to number', async () => {
      jest.spyOn(ordersService, 'findOne').mockResolvedValue(mockOrder);

      await controller.findOne('123');

      expect(ordersService.findOne).toHaveBeenCalledWith(123);
    });

    it('should throw NotFoundException if order not found', async () => {
      jest
        .spyOn(ordersService, 'findOne')
        .mockRejectedValue(new NotFoundException('Order not found'));

      await expect(controller.findOne('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update()', () => {
    it('should update an order', async () => {
      const updateOrderDto = {
        userId: 2,
        items: [{ productId: 3, quantity: 1 }],
      };

      const updatedOrder = {
        ...mockOrder,
        userId: 2,
      };

      jest.spyOn(ordersService, 'update').mockResolvedValue(updatedOrder);

      const result = await controller.update('1', updateOrderDto);

      expect(ordersService.update).toHaveBeenCalledWith(1, updateOrderDto);
      expect(result).toEqual(updatedOrder);
    });

    it('should convert string id to number during update', async () => {
      const updateOrderDto = { userId: 2 };

      jest.spyOn(ordersService, 'update').mockResolvedValue(mockOrder);

      await controller.update('456', updateOrderDto);

      expect(ordersService.update).toHaveBeenCalledWith(456, updateOrderDto);
    });

    it('should handle update errors', async () => {
      const updateOrderDto = { userId: 2 };

      jest
        .spyOn(ordersService, 'update')
        .mockRejectedValue(new NotFoundException('Order not found'));

      await expect(controller.update('999', updateOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update only items', async () => {
      const updateOrderDto = {
        items: [{ productId: 2, quantity: 3 }],
      };

      jest.spyOn(ordersService, 'update').mockResolvedValue(mockOrder);

      await controller.update('1', updateOrderDto);

      expect(ordersService.update).toHaveBeenCalledWith(1, updateOrderDto);
    });

    it('should update only userId', async () => {
      const updateOrderDto = {
        userId: 3,
      };

      jest.spyOn(ordersService, 'update').mockResolvedValue(mockOrder);

      await controller.update('1', updateOrderDto);

      expect(ordersService.update).toHaveBeenCalledWith(1, updateOrderDto);
    });
  });

  describe('remove()', () => {
    it('should remove an order', async () => {
      jest.spyOn(ordersService, 'remove').mockResolvedValue(mockOrder);

      const result = await controller.remove('1');

      expect(ordersService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockOrder);
    });

    it('should convert string id to number during remove', async () => {
      jest.spyOn(ordersService, 'remove').mockResolvedValue(mockOrder);

      await controller.remove('789');

      expect(ordersService.remove).toHaveBeenCalledWith(789);
    });

    it('should handle remove errors', async () => {
      jest
        .spyOn(ordersService, 'remove')
        .mockRejectedValue(new NotFoundException('Order not found'));

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus()', () => {
    it('should update order status', async () => {
      const updateStatusDto = { status: OrderStatus.CONFIRMED };

      const updatedOrder = {
        ...mockOrder,
        status: OrderStatus.CONFIRMED,
      };

      jest.spyOn(ordersService, 'updateStatus').mockResolvedValue(updatedOrder);

      const result = await controller.updateStatus('1', updateStatusDto);

      expect(ordersService.updateStatus).toHaveBeenCalledWith(
        1,
        OrderStatus.CONFIRMED,
      );
      expect(result).toEqual(updatedOrder);
    });

    it('should convert string id to number during status update', async () => {
      const updateStatusDto = { status: OrderStatus.SHIPPED };

      jest.spyOn(ordersService, 'updateStatus').mockResolvedValue(mockOrder);

      await controller.updateStatus('321', updateStatusDto);

      expect(ordersService.updateStatus).toHaveBeenCalledWith(
        321,
        OrderStatus.SHIPPED,
      );
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
        const updateStatusDto = { status };

        jest.spyOn(ordersService, 'updateStatus').mockResolvedValue({
          ...mockOrder,
          status,
        });

        const result = await controller.updateStatus('1', updateStatusDto);

        expect(ordersService.updateStatus).toHaveBeenCalledWith(1, status);
        expect(result.status).toBe(status);
      }
    });

    it('should handle status update errors', async () => {
      const updateStatusDto = { status: OrderStatus.SHIPPED };

      jest
        .spyOn(ordersService, 'updateStatus')
        .mockRejectedValue(new NotFoundException('Order not found'));

      await expect(
        controller.updateStatus('999', updateStatusDto),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
