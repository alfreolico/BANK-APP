import { CustomError } from './custom-error';

export class BusinessError extends CustomError {
  readonly statusCode = 400;
  readonly logging = true;
  readonly context?: object;

  constructor(message: string, context?: object) {
    super(message);
    this.context = context;
    Object.setPrototypeOf(this, BusinessError.prototype);
  }
}
