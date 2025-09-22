import { Injectable, NotFoundException } from '@nestjs/common';
import { Task } from './task.entity';
import { TaskRepository } from './task.repository';
import { CreateTaskDto, UpdateTaskDto } from '@tms-rbac-nx/data/tasks';

@Injectable()
export class TaskService {
  constructor(private readonly taskRepository: TaskRepository) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    return this.taskRepository.create(createTaskDto);
  }

  async findById(id: string): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async findByOrgId(orgId: number): Promise<Task[]> {
    return this.taskRepository.findByOrgId(orgId);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const existingTask = await this.findById(id);
    return this.taskRepository.update(id, updateTaskDto);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id); // This will throw NotFoundException if task doesn't exist
    return this.taskRepository.delete(id);
  }

  async toggleComplete(id: string): Promise<Task> {
    const task = await this.findById(id);
    return this.taskRepository.update(id, { isCompleted: !task.isCompleted });
  }
}
