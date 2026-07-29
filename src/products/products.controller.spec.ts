import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should create a product', async () => {
      const dto = {
        name: 'Laptop',
        description: 'A powerful laptop',
        price: 80000,
      };
      const result = { id: 1, ...dto };
      mockProductsService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(mockProductsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll()', () => {
    it('should return all products', async () => {
      const result = [
        {
          id: 1,
          name: 'Laptop',
          description: 'A powerful laptop',
          price: 80000,
        },
      ];
      mockProductsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
    });
  });

  describe('findOne()', () => {
    it('should return a product by id', async () => {
      const result = {
        id: 1,
        name: 'Laptop',
        description: 'A powerful laptop',
        price: 80000,
      };
      mockProductsService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('1')).toEqual(result);
      expect(mockProductsService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update()', () => {
    it('should update a product', async () => {
      const dto = { name: 'Gaming Laptop' };
      mockProductsService.update.mockResolvedValue({ affected: 1 });

      expect(await controller.update('1', dto)).toEqual({ affected: 1 });
      expect(mockProductsService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove()', () => {
    it('should delete a product', async () => {
      mockProductsService.remove.mockResolvedValue({ affected: 1 });

      expect(await controller.remove('1')).toEqual({ affected: 1 });
      expect(mockProductsService.remove).toHaveBeenCalledWith(1);
    });
  });
});
