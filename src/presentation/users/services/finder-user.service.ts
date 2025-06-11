import { AppDataSource } from '../../../data/postgres/postgres-database';
import { User } from '../../../data/postgres/models/user.model';
import {
  NotFoundError,
  DatabaseError,
  ValidationError,
} from '../../common/errors';
import { logError, logInfo } from '../../../utils/logger';

export class FinderUserService {
  constructor() {}

  async execute(userId: string): Promise<any> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundError('Usuario no encontrado', { userId });
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        account_number: user.account_number,
        balance: user.balance,
        created_at: user.created_at,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logError('Error obteniendo perfil de usuario', error as Error, {
        userId,
        action: 'get_user_profile',
      });

      throw new DatabaseError('Error interno obteniendo perfil de usuario');
    }
  }

  async executeByAccountNumber(accountNumber: string): Promise<any> {
    try {
      if (!accountNumber || accountNumber.length !== 20) {
        throw new ValidationError('Número de cuenta debe tener 20 dígitos', {
          accountNumber,
          providedLength: accountNumber?.length || 0,
        });
      }

      if (!/^\d{20}$/.test(accountNumber)) {
        throw new ValidationError(
          'Número de cuenta debe contener solo dígitos',
          {
            accountNumber,
          }
        );
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { account_number: accountNumber },
      });

      if (!user) {
        throw new NotFoundError(
          'Usuario no encontrado con ese número de cuenta',
          {
            accountNumber,
          }
        );
      }

      logInfo('Usuario encontrado por número de cuenta', {
        userId: user.id,
        accountNumber: user.account_number,
        searchedAccount: accountNumber,
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        account_number: user.account_number,
        balance: user.balance,
        created_at: user.created_at,
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }

      logError(
        'Error obteniendo usuario por número de cuenta',
        error as Error,
        {
          accountNumber,
          action: 'get_user_by_account',
        }
      );

      throw new DatabaseError(
        'Error interno obteniendo usuario por número de cuenta'
      );
    }
  }
}
