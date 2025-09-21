import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export const typeOrmConfigAsync = async (
  config: ConfigService
): Promise<TypeOrmModuleOptions> => ({
  type: 'postgres',
  host: config.get<string>('DB_HOST', 'localhost'),
  port: config.get<number>('DB_PORT', 5432),
  username: config.get<string>('DB_USERNAME'),
  password: config.get<string>('DB_PASSWORD'),
  database: config.get<string>('DB_NAME'),
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  synchronize: config.get<string>('DB_SYNC') === 'true',
  logging: config.get<string>('NODE_ENV') !== 'production',
});
