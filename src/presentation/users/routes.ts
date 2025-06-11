import { Router } from 'express';
import { UsersController } from './controller';
import { FinderUserService } from './services/finder-user.service';
import { authenticateToken } from '../common/middleware/auth';

export class UsersRoutes {
  static get routes(): Router {
    const router = Router();

    const finderUserService = new FinderUserService();
    const controller = new UsersController(finderUserService);

    router.get('/me', authenticateToken, controller.getProfile);

    router.get(
      '/account/:accountNumber',
      authenticateToken,
      controller.getUserByAccountNumber
    );

    return router;
  }
}
