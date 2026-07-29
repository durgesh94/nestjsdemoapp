import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

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
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should create a user', async () => {
      const dto = { name: 'John', email: 'john@example.com' };
      const result = { id: 1, ...dto };
      mockUsersService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(mockUsersService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll()', () => {
    it('should return all users', async () => {
      const result = [{ id: 1, name: 'John', email: 'john@example.com' }];
      mockUsersService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
    });
  });

  describe('findOne()', () => {
    it('should return a user by id', async () => {
      const result = { id: 1, name: 'John', email: 'john@example.com' };
      mockUsersService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('1')).toEqual(result);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update()', () => {
    it('should update a user', async () => {
      const dto = { name: 'Jane' };
      mockUsersService.update.mockResolvedValue({ affected: 1 });

      expect(await controller.update('1', dto)).toEqual({ affected: 1 });
      expect(mockUsersService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove()', () => {
    it('should delete a user', async () => {
      mockUsersService.remove.mockResolvedValue({ affected: 1 });

      expect(await controller.remove('1')).toEqual({ affected: 1 });
      expect(mockUsersService.remove).toHaveBeenCalledWith(1);
    });
  });
});
