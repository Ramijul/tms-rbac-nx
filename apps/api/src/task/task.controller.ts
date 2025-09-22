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
import { AuditLoggerService } from '../audit-logger/audit-logs.service';

const RESOURCE = 'task';

@Controller('org/:orgId/tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly auditLogger: AuditLoggerService
  ) {}

  @Post()
  async create(
    @Param('orgId') orgId: string,
    @Body() createTaskDto: CreateTaskDto,
    @Req() req: AuthenticatedRequest
  ): Promise<Task> {
    // Set the owner to the authenticated user and orgId from path
    createTaskDto.ownerId = req.user.userId;
    createTaskDto.orgId = parseInt(orgId);

    const task = await this.taskService.create(createTaskDto);

    this.auditLogger.log({
      resource: RESOURCE,
      action: 'Created a new task',
      orgId: parseInt(orgId),
      user: { id: req.user.userId, email: req.user.email },
      item: { id: task.id, title: task.title },
    });

    return task;
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
    @Body() updateTaskDto: UpdateTaskDto,
    @Param('orgId') orgId: string,
    @Req() req: AuthenticatedRequest
  ): Promise<Task> {
    const task = await this.taskService.update(id, updateTaskDto);

    this.auditLogger.log({
      resource: RESOURCE,
      action: 'Updated task',
      orgId: parseInt(orgId),
      user: { id: req.user.userId, email: req.user.email },
      item: { id: task.id, title: task.title },
    });

    return task;
  }

  @Patch(':id/toggle-complete')
  async toggleComplete(
    @Param('id') id: string,
    @Param('orgId') orgId: string,
    @Req() req: AuthenticatedRequest
  ): Promise<Task> {
    const task = await this.taskService.toggleComplete(id);

    this.auditLogger.log({
      resource: RESOURCE,
      action: `Status changed to ${
        task.isCompleted ? 'completed' : 'incomplete'
      }`,
      orgId: parseInt(orgId),
      user: { id: req.user.userId, email: req.user.email },
      item: { id: task.id, title: task.title },
    });

    return task;
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Param('orgId') orgId: string,
    @Req() req: AuthenticatedRequest
  ): Promise<void> {
    const task = await this.taskService.findById(id);
    await this.taskService.delete(id);

    this.auditLogger.log({
      resource: RESOURCE,
      action: 'Deleted task',
      orgId: parseInt(orgId),
      user: { id: req.user.userId, email: req.user.email },
      item: task,
    });
  }
}
