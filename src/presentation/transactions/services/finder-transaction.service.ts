import { AppDataSource } from '../../../data/postgres/postgres-database';
import { Transaction } from '../../../data/postgres/models/transaction.model';
import { NotFoundError, DatabaseError } from '../../common/errors';
import { logError } from '../../../utils/logger';

export class FinderTransactionService {
  constructor() {}

  async execute(transactionId: string, userId: string): Promise<any> {
    try {
      const transactionRepository = AppDataSource.getRepository(Transaction);

      const transaction = await transactionRepository
        .createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.sender', 'sender')
        .leftJoinAndSelect('transaction.receiver', 'receiver')
        .where('transaction.id = :id', { id: transactionId })
        .andWhere(
          '(transaction.sender_id = :userId OR transaction.receiver_id = :userId)',
          {
            userId: userId,
          }
        )
        .getOne();

      if (!transaction) {
        throw new NotFoundError('Transacción no encontrada', {
          transactionId,
          userId,
        });
      }

      return {
        id: transaction.id,
        amount: transaction.amount,
        type: transaction.sender_id === userId ? 'sent' : 'received',
        sender: {
          name: transaction.sender.name,
          account_number: transaction.sender.account_number,
        },
        receiver: {
          name: transaction.receiver.name,
          account_number: transaction.receiver.account_number,
        },
        transaction_date: transaction.transaction_date,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logError('Error obteniendo transacción específica', error as Error, {
        transactionId,
        userId,
        action: 'get_transaction_by_id',
      });

      throw new DatabaseError('Error interno obteniendo transacción');
    }
  }
}
