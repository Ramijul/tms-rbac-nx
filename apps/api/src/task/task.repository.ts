import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';

@Injectable()
export class TaskRepository {
  constructor(
    @InjectRepository(Task)
    private readonly repository: Repository<Task>
  ) {}

  async create(createTaskDto: any): Promise<Task> {
    const task = this.repository.create(createTaskDto);
    return this.repository.save(task) as unknown as Promise<Task>;
  }

  async findById(id: string): Promise<Task | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['organization', 'owner'],
    });
  }

  async findByOrgId(orgId: number): Promise<Task[]> {
    return this.repository.find({
      where: { orgId },
      relations: ['organization', 'owner'],
    });
  }

  async update(id: string, updateTaskDto: any): Promise<Task | null> {
    await this.repository.update(id, updateTaskDto);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
