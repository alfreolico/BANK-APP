import { AppDataSource } from '../../../data/postgres/postgres-database';
import { User } from '../../../data/postgres/models/user.model';
import { Transaction } from '../../../data/postgres/models/transaction.model';
import { CreateTransactionDto } from '../../../domain/dtos/transactions/create-transaction.dto';
import {
  BusinessError,
  NotFoundError,
  DatabaseError,
} from '../../common/errors';
import { logError, logInfo } from '../../../utils/logger';

export class CreatorTransactionService {
  constructor() {}

  async execute(
    createTransactionDto: CreateTransactionDto,
    senderId: string
  ): Promise<any> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { receiver_account_number, amount } = createTransactionDto;

      const userRepository = queryRunner.manager.getRepository(User);
      const transactionRepository =
        queryRunner.manager.getRepository(Transaction);

      // Buscar sender
      const sender = await userRepository.findOne({ where: { id: senderId } });
      if (!sender) {
        throw new NotFoundError('Usuario emisor no encontrado', { senderId });
      }

      // Verificar saldo suficiente
      if (Number(sender.balance) < amount) {
        await queryRunner.rollbackTransaction();
        throw new BusinessError(
          `Saldo insuficiente. Saldo actual: ${sender.balance} MXN`,
          {
            currentBalance: sender.balance,
            requestedAmount: amount,
            senderId: sender.id,
          }
        );
      }

      // Buscar receiver
      const receiver = await userRepository.findOne({
        where: { account_number: receiver_account_number },
      });
      if (!receiver) {
        await queryRunner.rollbackTransaction();
        throw new NotFoundError('Cuenta destinataria no encontrada', {
          receiver_account_number,
        });
      }

      // Verificar que no sea la misma cuenta
      if (sender.id === receiver.id) {
        await queryRunner.rollbackTransaction();
        throw new BusinessError(
          'No puedes transferir dinero a tu propia cuenta',
          {
            senderId: sender.id,
            receiverId: receiver.id,
          }
        );
      }

      // Actualizar balances
      const newSenderBalance = Number(sender.balance) - Number(amount);
      const newReceiverBalance = Number(receiver.balance) + Number(amount);

      sender.balance = newSenderBalance;
      receiver.balance = newReceiverBalance;

      await userRepository.save(sender);
      await userRepository.save(receiver);

      // Crear transacción
      const transaction = transactionRepository.create({
        sender_id: sender.id,
        receiver_id: receiver.id,
        amount: Number(amount),
      });

      const savedTransaction = await transactionRepository.save(transaction);
      await queryRunner.commitTransaction();

      logInfo('Transferencia realizada exitosamente', {
        transactionId: savedTransaction.id,
        senderId: sender.id,
        receiverId: receiver.id,
        amount: amount,
        senderNewBalance: newSenderBalance,
        receiverNewBalance: newReceiverBalance,
      });

      return {
        id: savedTransaction.id,
        amount: savedTransaction.amount,
        receiver_account: receiver.account_number,
        receiver_name: receiver.name,
        transaction_date: savedTransaction.transaction_date,
        new_balance: sender.balance,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof BusinessError || error instanceof NotFoundError) {
        throw error;
      }

      logError('Error en creación de transacción', error as Error, {
        senderId,
        receiver_account_number: createTransactionDto.receiver_account_number,
        amount: createTransactionDto.amount,
      });

      throw new DatabaseError('Error interno durante la transferencia');
    } finally {
      await queryRunner.release();
    }
  }
}
