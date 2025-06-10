import { CustomError } from './custom-error';

export class AuthorizationError extends CustomError {
  readonly statusCode = 403;
  readonly logging = true;
  readonly context?: object;

  constructor(message: string = 'Acceso denegado', context?: object) {
    super(message);
    this.context = context;
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}
