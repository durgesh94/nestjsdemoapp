import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let repository: any;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    findOne: jest.fn(),
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
        password: 'password123',
      };

      const mockUser = { id: 1, ...dto };
      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValue(mockUser);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll()', () => {
    it('should return all users', async () => {
      const users = [
        { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
        { id: 2, name: 'Jane Doe', email: 'jane.doe@example.com' },
      ];

      repository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });

    it('should return empty array if no users exist', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne()', () => {
    it('should return a user by id', async () => {
      const user = { id: 1, name: 'John Doe', email: 'john.doe@example.com' };

      repository.findOneBy.mockResolvedValue(user);

      const result = await service.findOne(1);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        'User with id 999 not found',
      );
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 999 });
    });
  });

  describe('update()', () => {
    it('should update a user', async () => {
      const user = { id: 1, name: 'John Doe', email: 'john.doe@example.com' };
      const dto = { name: 'John Smith' };
      const updatedUser = { ...user, ...dto };

      repository.findOneBy.mockResolvedValue(user);
      repository.save.mockResolvedValue(updatedUser);

      const result = await service.update(1, dto);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repository.save).toHaveBeenCalledWith(updatedUser);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Updated' })).rejects.toThrow(
        'User with id 999 not found',
      );
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 999 });
    });
  });

  describe('remove()', () => {
    it('should remove a user', async () => {
      const user = { id: 1, name: 'John Doe', email: 'john.doe@example.com' };

      repository.findOneBy.mockResolvedValue(user);
      repository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(
        'User with id 999 not found',
      );
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 999 });
    });
  });

  describe('findByEmail()', () => {
    it('should find a user by email', async () => {
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      repository.findOne.mockResolvedValue(user);

      const result = await service.findByEmail('john.doe@example.com');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'john.doe@example.com' },
      });
      expect(result).toEqual(user);
    });

    it('should return null if user not found by email', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });
});
