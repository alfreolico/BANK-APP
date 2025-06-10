import { CustomError } from './custom-error';

export class NotFoundError extends CustomError {
  readonly statusCode = 404;
  readonly logging = false;
  readonly context?: object;

  constructor(message: string = 'Recurso no encontrado', context?: object) {
    super(message);
    this.context = context;
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
