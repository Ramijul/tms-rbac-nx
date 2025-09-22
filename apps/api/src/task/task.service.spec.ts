import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskRepository } from './task.repository';
import { Task } from './task.entity';
import { CreateTaskDto } from '@tms-rbac-nx/data/tasks';

describe('TaskService', () => {
  let service: TaskService;
  let repository: jest.Mocked<TaskRepository>;

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

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByOrgId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: TaskRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    repository = module.get(TaskRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const createTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        orgId: 1,
        ownerId: 'user-1',
        category: 'work',
      };

      repository.create.mockResolvedValue(mockTask as any);

      const result = await service.create(createTaskDto);

      expect(repository.create).toHaveBeenCalledWith(createTaskDto);
      expect(result).toEqual(mockTask);
    });
  });

  describe('findById', () => {
    it('should return a task by id', async () => {
      repository.findById.mockResolvedValue(mockTask as any);

      const result = await service.findById('1');

      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith('999');
    });
  });

  describe('findByOrgId', () => {
    it('should return tasks by organization id', async () => {
      const tasks = [mockTask];
      repository.findByOrgId.mockResolvedValue(tasks as any);

      const result = await service.findByOrgId(1);

      expect(repository.findByOrgId).toHaveBeenCalledWith(1);
      expect(result).toEqual(tasks);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateData = { title: 'Updated Task' };
      const updatedTask = { ...mockTask, ...updateData };

      repository.findById.mockResolvedValue(mockTask as any);
      repository.update.mockResolvedValue(updatedTask as any);

      const result = await service.update('1', updateData);

      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(repository.update).toHaveBeenCalledWith('1', updateData);
      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('999', { title: 'Updated' })).rejects.toThrow(
        NotFoundException
      );
      expect(repository.findById).toHaveBeenCalledWith('999');
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      repository.findById.mockResolvedValue(mockTask as any);
      repository.delete.mockResolvedValue(undefined);

      await service.delete('1');

      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(repository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if task not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('999')).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith('999');
    });
  });

  describe('toggleComplete', () => {
    it('should toggle task completion status', async () => {
      const completedTask = { ...mockTask, isCompleted: true };

      repository.findById.mockResolvedValue(mockTask as any);
      repository.update.mockResolvedValue(completedTask as any);

      const result = await service.toggleComplete('1');

      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(repository.update).toHaveBeenCalledWith('1', {
        isCompleted: true,
      });
      expect(result).toEqual(completedTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.toggleComplete('999')).rejects.toThrow(
        NotFoundException
      );
      expect(repository.findById).toHaveBeenCalledWith('999');
    });
  });
});
