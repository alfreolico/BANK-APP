import { CustomError } from './custom-error';

export class DatabaseError extends CustomError {
  readonly statusCode = 500;
  readonly logging = true;
  readonly context?: object;

  constructor(message: string = 'Error de base de datos', context?: object) {
    super(message);
    this.context = context;
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}
