import { Router } from 'express';
import { AuthRoutes } from './presentation/auth/routes';
import { UsersRoutes } from './presentation/users/routes';
import { TransactionsRoutes } from './presentation/transactions/routes';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use('/api/auth', AuthRoutes.routes);
    router.use('/api/users', UsersRoutes.routes);
    router.use('/api/transactions', TransactionsRoutes.routes);

    return router;
  }
}
