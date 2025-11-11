import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import { existsSync } from 'fs';

// Carga variables de entorno desde .env (fallback a .env.development si existe)
const envPath = existsSync('.env')
  ? '.env'
  : (existsSync('.env.development') ? '.env.development' : undefined);
dotenvConfig(envPath ? { path: envPath } : undefined);

const config = {
  type: 'postgres',
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD as string,
  dropSchema: true,   //desactivar antes de deployar o migrar
  synchronize: true,  //desactivar antes de migrar
  logging: false,
  entities: ['dist/**/*.entity{.js,.ts}'],
  migrations: ['dist/**/*.migrations{.js,.ts}'],
};

export default registerAs('typeorm', () => config);

export const connectionSource = new DataSource(config as DataSourceOptions); //Solo se ejecuta en las migraciones
