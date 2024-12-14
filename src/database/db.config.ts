import { resolve } from 'path';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { registerAs } from '@nestjs/config';
const envPath = resolve(__dirname, '../..', '.env');

config({ path: envPath });

export const dbDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['dist/modules/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
};

export default registerAs('dbConfig', () => dbDataSourceOptions);
export const connectionSource = new DataSource(
  dbDataSourceOptions as DataSourceOptions,
);
