import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskRepository } from './task.repository';
import { Task } from './task.entity';

describe('TaskRepository', () => {
  let repository: TaskRepository;
  let mockRepository: jest.Mocked<Repository<Task>>;

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
    const mockRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskRepository,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepo,
        },
      ],
    }).compile();

    repository = module.get<TaskRepository>(TaskRepository);
    mockRepository = module.get(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
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

      mockRepository.create.mockReturnValue(mockTask as any);
      mockRepository.save.mockResolvedValue(mockTask as any);

      const result = await repository.create(createTaskDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createTaskDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockTask);
      expect(result).toEqual(mockTask);
    });
  });

  describe('findById', () => {
    it('should return a task by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask as any);

      const result = await repository.findById('1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['organization', 'owner'],
      });
      expect(result).toEqual(mockTask);
    });

    it('should return null if task not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findByOrgId', () => {
    it('should return tasks by organization id', async () => {
      const tasks = [mockTask];
      mockRepository.find.mockResolvedValue(tasks as any);

      const result = await repository.findByOrgId(1);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { orgId: 1 },
        relations: ['organization', 'owner'],
      });
      expect(result).toEqual(tasks);
    });
  });

  describe('update', () => {
    it('should update a task and return the updated task', async () => {
      const updateData = { title: 'Updated Task' };
      mockRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockRepository.findOne.mockResolvedValue({
        ...mockTask,
        ...updateData,
      } as any);

      const result = await repository.update('1', updateData);

      expect(mockRepository.update).toHaveBeenCalledWith('1', updateData);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['organization', 'owner'],
      });
      expect(result).toEqual({ ...mockTask, ...updateData });
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await repository.delete('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });
  });
});
