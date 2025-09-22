import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { AuditLoggerService } from './audit-logs.service';
import { PaginationDto, AuditLogsResponseDto } from './dto';
import {
  JwtAuthGuard,
  AuthenticatedRequest,
} from '@tms-rbac-nx/auth/jwt-auth.guard';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogsController {
  constructor(private readonly auditLoggerService: AuditLoggerService) {}

  @Get()
  async getLogs(
    @Query() paginationDto: PaginationDto,
    @Req() req: AuthenticatedRequest
  ): Promise<AuditLogsResponseDto> {
    const { page = 1, limit = 10 } = paginationDto;

    return this.auditLoggerService.getLogs(page, limit);
  }
}
