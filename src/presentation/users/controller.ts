import { Response } from 'express';
import { FinderUserService } from './services/finder-user.service';
import { asyncHandler } from '../common/middleware/async-handler';
import { AuthenticatedRequest } from '../common/middleware/auth';
import { ValidationError } from '../common/errors';

export class UsersController {
  constructor(private readonly finderUserService: FinderUserService) {}

  getProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const user = await this.finderUserService.execute(req.user!.id);
      res.json({ user });
    }
  );

  getUserByAccountNumber = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { accountNumber } = req.params;

      if (!accountNumber) {
        throw new ValidationError('Número de cuenta es requerido');
      }

      const user = await this.finderUserService.executeByAccountNumber(
        accountNumber
      );
      res.json({
        user: {
          name: user.name,
          account_number: user.account_number,
        },
      });
    }
  );
}
