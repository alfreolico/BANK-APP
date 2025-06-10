import { Request, Response, NextFunction } from 'express';
import { RegisterUserDto } from '../../domain/dtos/auth/register-user.dto';
import { LoginUserDto } from '../../domain/dtos/auth/login-user.dto';
import { RegisterUserService } from './services/register-user.service';
import { LoginUserService } from './services/login-user.service';
import { ValidationError } from '../common/errors';
import { asyncHandler } from '../common/middleware/async-handler';
import { logInfo } from '../../utils/logger';

export class AuthController {
  constructor(
    private readonly registerUserService: RegisterUserService,
    private readonly loginUserService: LoginUserService
  ) {}

  registerUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const [error, registerUserDto] = RegisterUserDto.create(req.body);
      if (error) {
        throw new ValidationError(error, { body: req.body });
      }

      const user = await this.registerUserService.execute(registerUserDto!);

      logInfo('Usuario registrado exitosamente', {
        userId: user.id,
        email: user.email,
        ip: req.ip,
      });

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user,
      });
    }
  );

  loginUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const [error, loginUserDto] = LoginUserDto.create(req.body);
      if (error) {
        throw new ValidationError(error, { email: req.body.email });
      }

      const result = await this.loginUserService.execute(loginUserDto!);

      logInfo('Usuario logueado exitosamente', {
        email: loginUserDto!.email,
        ip: req.ip,
      });

      res.json({
        message: 'Login exitoso',
        ...result,
      });
    }
  );
}
