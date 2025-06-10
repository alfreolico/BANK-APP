import { DataSource } from 'typeorm';
import { User } from './models/user.model';
import { Transaction } from './models/transaction.model';
import { envs } from '../../config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: envs.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  entities: [User, Transaction],
  synchronize: envs.NODE_ENV === 'development',
  logging: false,
});
