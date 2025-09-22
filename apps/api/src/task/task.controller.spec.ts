import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from '@tms-rbac-nx/data/tasks';
import { Task } from './task.entity';
import { AuthenticatedRequest } from '@tms-rbac-nx/auth/jwt-auth.guard';

describe('TaskController', () => {
  let controller: TaskController;
  let service: jest.Mocked<TaskService>;

  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    isCompleted: false,
    orgId: 1,
    ownerId: 'user-1',
    category: 'work',
    organization: null,
    owner: null,
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z'),
  };

  const mockRequest: AuthenticatedRequest = {
    user: { userId: 'user-1' },
  } as any;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findById: jest.fn(),
      findByOrgId: jest.fn(),
      update: jest.fn(),
      toggleComplete: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    service = module.get(TaskService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        ownerId: 'user-1',
        category: 'work',
      };

      service.create.mockResolvedValue(mockTask as any);

      const result = await controller.create('1', createTaskDto, mockRequest);

      expect(service.create).toHaveBeenCalledWith({
        ...createTaskDto,
        ownerId: 'user-1',
        orgId: 1,
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe('findAll', () => {
    it('should return all tasks for the organization', async () => {
      const tasks = [mockTask];
      service.findByOrgId.mockResolvedValue(tasks as any);

      const result = await controller.findAll('1');

      expect(service.findByOrgId).toHaveBeenCalledWith(1);
      expect(result).toEqual(tasks);
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      service.findById.mockResolvedValue(mockTask as any);

      const result = await controller.findOne('1');

      expect(service.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockTask);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateTaskDto: UpdateTaskDto = { title: 'Updated Task' };
      const updatedTask = { ...mockTask, ...updateTaskDto };

      service.update.mockResolvedValue(updatedTask as any);

      const result = await controller.update('1', updateTaskDto);

      expect(service.update).toHaveBeenCalledWith('1', updateTaskDto);
      expect(result).toEqual(updatedTask);
    });
  });

  describe('toggleComplete', () => {
    it('should toggle task completion status', async () => {
      const completedTask = { ...mockTask, isCompleted: true };
      service.toggleComplete.mockResolvedValue(completedTask as any);

      const result = await controller.toggleComplete('1');

      expect(service.toggleComplete).toHaveBeenCalledWith('1');
      expect(result).toEqual(completedTask);
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.delete).toHaveBeenCalledWith('1');
    });
  });
});
