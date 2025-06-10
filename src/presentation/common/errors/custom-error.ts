export abstract class CustomError extends Error {
  abstract readonly statusCode: number;
  abstract readonly logging: boolean;
  abstract readonly context?: object;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
