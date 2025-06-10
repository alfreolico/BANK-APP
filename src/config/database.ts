import { DataSource } from 'typeorm';
import { User } from '../data/postgres/models/user.model';
import { Transaction } from '../data/postgres/models/transaction.model';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  entities: [User, Transaction],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
});
