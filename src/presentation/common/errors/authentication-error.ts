import { CustomError } from './custom-error';

export class AuthenticationError extends CustomError {
  readonly statusCode = 401;
  readonly logging = true;
  readonly context?: object;

  constructor(message: string = 'No autorizado', context?: object) {
    super(message);
    this.context = context;
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}
