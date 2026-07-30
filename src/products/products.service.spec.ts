import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: jest.Mocked<Repository<Product>>;

  const mockRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get(getRepositoryToken(Product));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should save a product', async () => {
      const dto: CreateProductDto = {
        name: 'Laptop',
        description: 'A powerful laptop',
        price: 80000,
      };

      repository.save.mockResolvedValue(dto as Product);

      const result = await service.create(dto);

      expect(mockRepository.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual(dto);
    });
  });
  describe('findAll()', () => {
    it('should return all products', async () => {
      const products = [
        { id: 1, name: 'Laptop', price: 80000 },
        { id: 2, name: 'Mouse', price: 500 },
      ];

      repository.find.mockResolvedValue(products as Product[]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(products);
    });
  });

  describe('findOne()', () => {
    it('should return one product', async () => {
      const product = {
        id: 1,
        name: 'Laptop',
        price: 80000,
      };

      repository.findOneBy.mockResolvedValue(product as Product);

      const result = await service.findOne(1);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(product);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow('Product with id 999 not found');
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
    });
  });

  describe('update()', () => {
    it('should update a product', async () => {
      const product = {
        id: 1,
        name: 'Laptop',
        price: 80000,
      };

      const updateDto = {
        name: 'Gaming Laptop',
      };

      const updatedProduct = {
        ...product,
        ...updateDto,
      };

      repository.findOneBy.mockResolvedValue(product as Product);
      repository.save.mockResolvedValue(updatedProduct as Product);

      const result = await service.update(1, updateDto);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedProduct);
      expect(result).toEqual(updatedProduct);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.update(1, { name: 'Updated' })).rejects.toThrow('Product with id 1 not found');
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('remove()', () => {
    it('should delete a product', async () => {
      const product = {
        id: 1,
        name: 'Laptop',
        price: 80000,
      };

      repository.findOneBy.mockResolvedValue(product as Product);
      repository.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.remove(1);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual(product);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow('Product with id 1 not found');
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });
  });
});
