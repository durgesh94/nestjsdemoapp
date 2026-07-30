import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create()', () => {
    it('should save a user', async () => {
      const dto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      repository.create.mockReturnValue(dto as User);
      repository.save.mockResolvedValue(dto as User);

      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual(dto);
    });
  });
  describe('findAll()', () => {
    it('should return all users', async () => {
      const users = [
        { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
        { id: 2, name: 'Jane Doe', email: 'jane.doe@example.com' },
      ];

      repository.find.mockResolvedValue(users as User[]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });
  describe('findOne()', () => {
    it('should return a user by id', async () => {
      const user = { id: 1, name: 'John Doe', email: 'john.doe@example.com' };

      repository.findOneBy.mockResolvedValue(user as User);

      const result = await service.findOne(1);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(user);
    });
  });
  describe('update()', () => {
    it('should update a user', async () => {
      const dto = { name: 'John Smith' };

      repository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.update(1, dto);

      expect(mockRepository.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual({ affected: 1 });
    });
  });
  describe('remove()', () => {
    it('should remove a user', async () => {
      repository.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.remove(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ affected: 1 });
    });
  });
});
