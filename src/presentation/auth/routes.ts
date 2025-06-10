import { Router } from 'express';
import { AuthController } from './controller';
import { RegisterUserService } from './services/register-user.service';
import { LoginUserService } from './services/login-user.service';

export class AuthRoutes {
  static get routes(): Router {
    const router = Router();

    const registerUserService = new RegisterUserService();
    const loginUserService = new LoginUserService();
    const controller = new AuthController(
      registerUserService,
      loginUserService
    );

    router.post('/register', controller.registerUser);
    router.post('/login', controller.loginUser);

    return router;
  }
}
