import { AppDataSource } from '../../../data/postgres/postgres-database';
import { Transaction } from '../../../data/postgres/models/transaction.model';
import { DatabaseError } from '../../common/errors';
import { logError } from '../../../utils/logger';

export class FinderTransactionsService {
  constructor() {}

  async execute(userId: string): Promise<any> {
    try {
      const transactionRepository = AppDataSource.getRepository(Transaction);

      const transactions = await transactionRepository
        .createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.sender', 'sender')
        .leftJoinAndSelect('transaction.receiver', 'receiver')
        .where(
          'transaction.sender_id = :userId OR transaction.receiver_id = :userId',
          {
            userId: userId,
          }
        )
        .orderBy('transaction.transaction_date', 'DESC')
        .getMany();

      const formattedTransactions = transactions.map((transaction) => ({
        id: transaction.id,
        amount: transaction.amount,
        type: transaction.sender_id === userId ? 'sent' : 'received',
        other_party:
          transaction.sender_id === userId
            ? {
                name: transaction.receiver.name,
                account_number: transaction.receiver.account_number,
              }
            : {
                name: transaction.sender.name,
                account_number: transaction.sender.account_number,
              },
        transaction_date: transaction.transaction_date,
      }));

      return {
        transactions: formattedTransactions,
        total: formattedTransactions.length,
      };
    } catch (error) {
      logError('Error obteniendo transacciones', error as Error, {
        userId,
        action: 'get_transactions',
      });

      throw new DatabaseError('Error interno obteniendo transacciones');
    }
  }
}
