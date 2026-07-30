import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from './enums/user-role.enum';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: any;

  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    role: UserRole.CUSTOMER,
    isActive: true,
    orders: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserResponse = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: UserRole.CUSTOMER,
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should create a user and return user response', async () => {
      const dto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);

      const result = await controller.create(dto);

      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUserResponse);
    });
  });

  describe('findAll()', () => {
    it('should return all users as user responses', async () => {
      const mockUsers = [
        mockUser,
        {
          ...mockUser,
          id: 2,
          name: 'Jane Doe',
          email: 'jane@example.com',
        },
      ];

      jest.spyOn(usersService, 'findAll').mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockUserResponse);
    });

    it('should return empty array if no users exist', async () => {
      jest.spyOn(usersService, 'findAll').mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne()', () => {
    it('should return a user by id as user response', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

      const result = await controller.findOne('1');

      expect(usersService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUserResponse);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(usersService, 'findOne').mockRejectedValue(new Error('User with id 999 not found'));

      await expect(controller.findOne('999')).rejects.toThrow('User with id 999 not found');
    });
  });

  describe('update()', () => {
    it('should update a user', async () => {
      const dto = { name: 'Jane Doe' };
      const updatedUser = { ...mockUser, name: 'Jane Doe' };

      jest.spyOn(usersService, 'update').mockResolvedValue(updatedUser);

      const result = await controller.update('1', dto);

      expect(usersService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual({
        message: 'User updated successfully',
        data: {
          id: 1,
          name: 'Jane Doe',
          email: 'john@example.com',
          role: UserRole.CUSTOMER,
        },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const dto = { name: 'Jane Doe' };

      jest.spyOn(usersService, 'update').mockRejectedValue(new Error('User with id 999 not found'));

      await expect(controller.update('999', dto)).rejects.toThrow('User with id 999 not found');
    });
  });

  describe('remove()', () => {
    it('should delete a user', async () => {
      jest.spyOn(usersService, 'remove').mockResolvedValue(mockUser);

      const result = await controller.remove('1');

      expect(usersService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: 'User removed successfully',
        data: mockUserResponse,
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(usersService, 'remove').mockRejectedValue(new Error('User with id 999 not found'));

      await expect(controller.remove('999')).rejects.toThrow('User with id 999 not found');
    });
  });
});
