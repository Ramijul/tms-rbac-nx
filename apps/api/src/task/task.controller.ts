import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from '@tms-rbac-nx/data/tasks';
import { Task } from './task.entity';
import {
  JwtAuthGuard,
  AuthenticatedRequest,
} from '@tms-rbac-nx/auth/jwt-auth.guard';

@Controller('org/:orgId/tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  async create(
    @Param('orgId') orgId: string,
    @Body() createTaskDto: CreateTaskDto,
    @Req() req: AuthenticatedRequest
  ): Promise<Task> {
    // Set the owner to the authenticated user and orgId from path
    createTaskDto.ownerId = req.user.userId;
    createTaskDto.orgId = parseInt(orgId);
    return this.taskService.create(createTaskDto);
  }

  @Get()
  async findAll(@Param('orgId') orgId: string): Promise<Task[]> {
    const orgIdNum = parseInt(orgId);
    return this.taskService.findByOrgId(orgIdNum);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Task> {
    return this.taskService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto
  ): Promise<Task> {
    return this.taskService.update(id, updateTaskDto);
  }

  @Patch(':id/toggle-complete')
  async toggleComplete(@Param('id') id: string): Promise<Task> {
    return this.taskService.toggleComplete(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.taskService.delete(id);
  }
}
