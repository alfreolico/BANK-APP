import { Router } from 'express';
import { UsersController } from './controller';
import { FinderUserService } from './services/finder-user.service';
import { authenticateToken } from '../common/middleware/auth';

export class UsersRoutes {
  static get routes(): Router {
    const router = Router();

    const finderUserService = new FinderUserService();
    const controller = new UsersController(finderUserService);

    // Ruta existente - Perfil del usuario autenticado
    router.get('/me', authenticateToken, controller.getProfile);

    // NUEVA RUTA - Buscar usuario por número de cuenta
    router.get(
      '/account/:accountNumber',
      authenticateToken,
      controller.getUserByAccountNumber
    );

    return router;
  }
}
