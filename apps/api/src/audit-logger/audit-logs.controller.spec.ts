import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLoggerService } from './audit-logs.service';
import { JwtAuthGuard } from '@tms-rbac-nx/auth/jwt-auth.guard';

describe('AuditLogsController', () => {
  let controller: AuditLogsController;
  let auditLoggerService: jest.Mocked<AuditLoggerService>;

  const mockAuditLoggerService = {
    getLogs: jest.fn(),
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogsController],
      providers: [
        {
          provide: AuditLoggerService,
          useValue: mockAuditLoggerService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuditLogsController>(AuditLogsController);
    auditLoggerService = module.get(AuditLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLogs', () => {
    it('should return paginated logs with default values', async () => {
      const mockLogs = {
        logs: [
          {
            timestamp: '2023-01-01T00:00:00.000Z',
            action: 'test_action',
            userId: '123',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      const mockRequest = {
        user: { userId: '123' },
      } as any;

      auditLoggerService.getLogs.mockResolvedValue(mockLogs);

      const result = await controller.getLogs({}, mockRequest);

      expect(result).toEqual(mockLogs);
      expect(auditLoggerService.getLogs).toHaveBeenCalledWith(1, 10);
      expect(auditLoggerService.log).toHaveBeenCalledWith({
        resource: 'audit-logs',
        action: 'read',
        userId: '123',
        page: 1,
        limit: 10,
      });
    });

    it('should return paginated logs with custom pagination', async () => {
      const mockLogs = {
        logs: [
          {
            timestamp: '2023-01-01T00:00:00.000Z',
            action: 'test_action',
            userId: '123',
          },
        ],
        total: 5,
        page: 2,
        limit: 2,
        totalPages: 3,
      };

      const mockRequest = {
        user: { userId: '456' },
      } as any;

      const paginationDto = { page: 2, limit: 2 };

      auditLoggerService.getLogs.mockResolvedValue(mockLogs);

      const result = await controller.getLogs(paginationDto, mockRequest);

      expect(result).toEqual(mockLogs);
      expect(auditLoggerService.getLogs).toHaveBeenCalledWith(2, 2);
      expect(auditLoggerService.log).toHaveBeenCalledWith({
        resource: 'audit-logs',
        action: 'read',
        userId: '456',
        page: 2,
        limit: 2,
      });
    });

    it('should handle empty logs', async () => {
      const mockLogs = {
        logs: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      const mockRequest = {
        user: { userId: '789' },
      } as any;

      auditLoggerService.getLogs.mockResolvedValue(mockLogs);

      const result = await controller.getLogs({}, mockRequest);

      expect(result).toEqual(mockLogs);
      expect(auditLoggerService.getLogs).toHaveBeenCalledWith(1, 10);
      expect(auditLoggerService.log).toHaveBeenCalledWith({
        resource: 'audit-logs',
        action: 'read',
        userId: '789',
        page: 1,
        limit: 10,
      });
    });
  });
});
