import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

const LOG_FILE_NAME = 'audit-logs.json';

@Injectable()
export class AuditLoggerService {
  private readonly logFilePath: string;

  constructor() {
    this.logFilePath = join(process.cwd(), LOG_FILE_NAME);
  }

  /**
   * Logs JSON data to console and appends to JSON file
   */
  log(message: Record<string, any>, timestamp?: Date): void {
    const logEntry = this.createLogEntry(message, timestamp);
    this.logToConsole(logEntry);
    this.logToFile(logEntry);
  }

  private createLogEntry(
    message: Record<string, any>,
    timestamp?: Date
  ): Record<string, any> {
    const logTimestamp = timestamp || new Date();
    return {
      timestamp: logTimestamp.toISOString(),
      ...message,
    };
  }

  private logToConsole(logEntry: Record<string, any>): void {
    const { timestamp, ...message } = logEntry;
    console.log(`[${timestamp}]`, JSON.stringify(message, null, 2));
  }

  private async logToFile(logEntry: Record<string, any>): Promise<void> {
    try {
      // Ensure the log file exists and is a valid JSON array
      await this.ensureLogFileExists();

      // Read existing logs
      const existingLogs = await this.readLogFile();

      // Append new log entry
      existingLogs.push(logEntry);

      // Write updated logs back to file
      await fs.writeFile(
        this.logFilePath,
        JSON.stringify(existingLogs, null, 2),
        'utf8'
      );
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private async ensureLogFileExists(): Promise<void> {
    try {
      await fs.access(this.logFilePath);
      // File exists, verify it's valid JSON
      const content = await fs.readFile(this.logFilePath, 'utf8');
      JSON.parse(content);
    } catch (error) {
      // File doesn't exist or is invalid JSON, create new one
      await fs.writeFile(this.logFilePath, '[]', 'utf8');
    }
  }

  private async readLogFile(): Promise<Record<string, any>[]> {
    try {
      const content = await fs.readFile(this.logFilePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get logs with pagination in descending order of timestamp
   */
  async getLogs(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    logs: Record<string, any>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const allLogs = await this.readLogFile();

    // Sort by timestamp in descending order (newest first)
    const sortedLogs = allLogs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const total = sortedLogs.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // Get paginated logs
    const paginatedLogs = sortedLogs.slice(offset, offset + limit);

    return {
      logs: paginatedLogs,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
