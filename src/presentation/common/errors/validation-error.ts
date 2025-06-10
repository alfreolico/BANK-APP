import { CustomError } from './custom-error';

export class ValidationError extends CustomError {
  readonly statusCode = 400;
  readonly logging = false;
  readonly context?: object;

  constructor(message: string, context?: object) {
    super(message);
    this.context = context;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
