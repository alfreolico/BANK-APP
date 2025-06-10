import { DataSource } from 'typeorm';
import { User } from '../data/postgres/models/user.model';
import { Transaction } from '../data/postgres/models/transaction.model';
import { envs } from '../config/envs';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: envs.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  entities: [User, Transaction],
  synchronize: envs.NODE_ENV === 'development',
  logging: envs.NODE_ENV === 'development',
});
