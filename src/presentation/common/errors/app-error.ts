import { CustomError } from './custom-error';

export class AppError extends CustomError {
  readonly statusCode: number;
  readonly logging: boolean;
  readonly context?: object;

  constructor(
    message: string,
    statusCode: number = 500,
    logging: boolean = true,
    context?: object
  ) {
    super(message);
    this.statusCode = statusCode;
    this.logging = logging;
    this.context = context;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
