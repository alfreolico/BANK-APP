import { Router } from 'express';
import { TransactionsController } from './controller';
import { CreatorTransactionService } from './services/creator-transaction.service';
import { FinderTransactionsService } from './services/finder-transactions.service';
import { FinderTransactionService } from './services/finder-transaction.service';
import { authenticateToken } from '../common/middleware/auth';

export class TransactionsRoutes {
  static get routes(): Router {
    const router = Router();

    const creatorTransactionService = new CreatorTransactionService();
    const finderTransactionsService = new FinderTransactionsService();
    const finderTransactionService = new FinderTransactionService();

    const controller = new TransactionsController(
      creatorTransactionService,
      finderTransactionsService,
      finderTransactionService
    );

    router.post('/', authenticateToken, controller.createTransaction);
    router.get('/', authenticateToken, controller.getTransactions);
    router.get('/:id', authenticateToken, controller.getTransactionById);

    return router;
  }
}
