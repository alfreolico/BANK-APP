import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../../../data/postgres/postgres-database';
import { User } from '../../../data/postgres/models/user.model';
import { AuthenticationError, AuthorizationError } from '../errors';
import { envs } from '../../../config';
import { logWarn } from '../../../utils/logger';

interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new AuthenticationError('Token de acceso requerido', {
        path: req.path,
        ip: req.ip,
      });
    }

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, envs.JWT_SECRET!) as { userId: string };
    } catch (jwtError: any) {
      if (jwtError.name === 'TokenExpiredError') {
        throw new AuthorizationError('Token expirado', {
          path: req.path,
          ip: req.ip,
        });
      }
      throw new AuthorizationError('Token inválido', {
        path: req.path,
        ip: req.ip,
      });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.userId },
    });

    if (!user) {
      logWarn('Token válido pero usuario no encontrado', {
        userId: decoded.userId,
        path: req.path,
        ip: req.ip,
      });
      throw new AuthenticationError('Usuario no encontrado', {
        userId: decoded.userId,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export { AuthenticatedRequest };
