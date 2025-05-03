export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, error?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.name = this.constructor.name;
    if (error) {
      this.stack = error.stack;
    }
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  details: any;

  constructor(message: string, details?: any) {
    super(400, message);
    this.details = details;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class BusinessError extends AppError {
  constructor(message: string) {
    super(422, message);
    Object.setPrototypeOf(this, BusinessError.prototype);
  }
} 