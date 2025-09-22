export class AuditLogsResponseDto {
  logs: Record<string, any>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
