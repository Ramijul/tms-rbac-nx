import { Test, TestingModule } from '@nestjs/testing';
import { AuditLoggerService } from './audit-logs.service';
import { promises as fs } from 'fs';
import { join } from 'path';

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    stat: jest.fn(),
    rename: jest.fn(),
  },
}));

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

describe('AuditLoggerService', () => {
  let service: AuditLoggerService;
  let mockFs: jest.Mocked<typeof fs>;

  beforeEach(async () => {
    mockFs = fs as jest.Mocked<typeof fs>;

    // Reset all mocks
    jest.clearAllMocks();
    mockConsoleLog.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditLoggerService],
    }).compile();

    service = module.get<AuditLoggerService>(AuditLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should log JSON data to console and file', async () => {
      mockFs.access.mockRejectedValue(new Error('File not found'));
      mockFs.readFile.mockResolvedValue('[]');
      mockFs.writeFile.mockResolvedValue();

      const testData = { userId: '123', action: 'login' };
      service.log(testData);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringMatching(
          /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/
        ),
        JSON.stringify(testData, null, 2)
      );
      expect(mockFs.writeFile).toHaveBeenCalled();
    });

    it('should log with custom timestamp', async () => {
      mockFs.access.mockRejectedValue(new Error('File not found'));
      mockFs.readFile.mockResolvedValue('[]');
      mockFs.writeFile.mockResolvedValue();

      const testData = { userId: '123', action: 'login' };
      const customTimestamp = new Date('2023-01-01T00:00:00.000Z');
      service.log(testData, customTimestamp);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[2023-01-01T00:00:00.000Z]',
        JSON.stringify(testData, null, 2)
      );
      expect(mockFs.writeFile).toHaveBeenCalled();
    });
  });

  describe('file operations', () => {
    it('should create log file if it does not exist', async () => {
      mockFs.access.mockRejectedValue(new Error('File not found'));
      mockFs.readFile.mockResolvedValue('[]');
      mockFs.writeFile.mockResolvedValue();

      const testData = { action: 'test' };
      service.log(testData);

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('audit-logs.json'),
        '[]',
        'utf8'
      );
    });

    it('should append to existing log file', async () => {
      const existingLogs = [
        {
          timestamp: '2023-01-01T00:00:00.000Z',
          action: 'old_action',
        },
      ];

      mockFs.access.mockResolvedValue();
      mockFs.readFile.mockResolvedValue(JSON.stringify(existingLogs));
      mockFs.writeFile.mockResolvedValue();

      const testData = { action: 'new_action' };
      service.log(testData);

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('audit-logs.json'),
        expect.stringContaining('old_action'),
        'utf8'
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('audit-logs.json'),
        expect.stringContaining('new_action'),
        'utf8'
      );
    });

    it('should handle file read errors gracefully', async () => {
      mockFs.access.mockRejectedValue(new Error('File not found'));
      mockFs.readFile.mockRejectedValue(new Error('Read error'));
      mockFs.writeFile.mockResolvedValue();

      const testData = { action: 'test' };
      // Should not throw error
      expect(() => service.log(testData)).not.toThrow();
    });
  });

  describe('log entry structure', () => {
    it('should create proper log entry structure', async () => {
      mockFs.access.mockRejectedValue(new Error('File not found'));
      mockFs.readFile.mockResolvedValue('[]');
      mockFs.writeFile.mockResolvedValue();

      const testData = { action: 'test', userId: '123' };
      service.log(testData);

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('audit-logs.json'),
        expect.stringMatching(
          /\[.*"timestamp".*"action":"test".*"userId":"123".*\]/
        ),
        'utf8'
      );
    });
  });

  describe('getLogs', () => {
    it('should return paginated logs in descending order', async () => {
      const mockLogs = [
        {
          timestamp: '2023-01-01T00:00:00.000Z',
          action: 'old_action',
          userId: '1',
        },
        {
          timestamp: '2023-01-02T00:00:00.000Z',
          action: 'new_action',
          userId: '2',
        },
        {
          timestamp: '2023-01-03T00:00:00.000Z',
          action: 'latest_action',
          userId: '3',
        },
      ];

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockLogs));

      const result = await service.getLogs(1, 2);

      expect(result).toEqual({
        logs: [
          {
            timestamp: '2023-01-03T00:00:00.000Z',
            action: 'latest_action',
            userId: '3',
          },
          {
            timestamp: '2023-01-02T00:00:00.000Z',
            action: 'new_action',
            userId: '2',
          },
        ],
        total: 3,
        page: 1,
        limit: 2,
        totalPages: 2,
      });
    });

    it('should return second page of logs', async () => {
      const mockLogs = [
        { timestamp: '2023-01-01T00:00:00.000Z', action: 'action1' },
        { timestamp: '2023-01-02T00:00:00.000Z', action: 'action2' },
        { timestamp: '2023-01-03T00:00:00.000Z', action: 'action3' },
        { timestamp: '2023-01-04T00:00:00.000Z', action: 'action4' },
      ];

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockLogs));

      const result = await service.getLogs(2, 2);

      expect(result).toEqual({
        logs: [
          { timestamp: '2023-01-02T00:00:00.000Z', action: 'action2' },
          { timestamp: '2023-01-01T00:00:00.000Z', action: 'action1' },
        ],
        total: 4,
        page: 2,
        limit: 2,
        totalPages: 2,
      });
    });

    it('should handle empty logs', async () => {
      mockFs.readFile.mockResolvedValue('[]');

      const result = await service.getLogs();

      expect(result).toEqual({
        logs: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });

    it('should use default pagination values', async () => {
      mockFs.readFile.mockResolvedValue('[]');

      const result = await service.getLogs();

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });
});
