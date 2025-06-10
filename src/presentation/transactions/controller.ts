import { Response } from 'express';
import { CreateTransactionDto } from '../../domain/dtos/transactions/create-transaction.dto';
import { CreatorTransactionService } from './services/creator-transaction.service';
import { FinderTransactionsService } from './services/finder-transactions.service';
import { FinderTransactionService } from './services/finder-transaction.service';
import { ValidationError } from '../common/errors';
import { asyncHandler } from '../common/middleware/async-handler';
import { AuthenticatedRequest } from '../common/middleware/auth';

export class TransactionsController {
  constructor(
    private readonly creatorTransactionService: CreatorTransactionService,
    private readonly finderTransactionsService: FinderTransactionsService,
    private readonly finderTransactionService: FinderTransactionService
  ) {}

  createTransaction = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const [error, createTransactionDto] = CreateTransactionDto.create(
        req.body
      );
      if (error) {
        throw new ValidationError(error, { body: req.body });
      }

      const transaction = await this.creatorTransactionService.execute(
        createTransactionDto!,
        req.user!.id
      );

      res.status(201).json({
        message: 'Transferencia realizada exitosamente',
        transaction,
      });
    }
  );

  getTransactions = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const result = await this.finderTransactionsService.execute(req.user!.id);
      res.json(result);
    }
  );

  getTransactionById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      const transaction = await this.finderTransactionService.execute(
        id,
        req.user!.id
      );
      res.json({ transaction });
    }
  );
}
