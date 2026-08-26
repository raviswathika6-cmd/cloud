import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  console.error(`[ERROR] ${statusCode}: ${message}`, err.stack);

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export class ValidationError extends Error implements AppError {
  statusCode = 400;
  isOperational = true;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends Error implements AppError {
  statusCode = 404;
  isOperational = true;

  constructor(message: string = 'Resource not found') {
    super(message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends Error implements AppError {
  statusCode = 401;
  isOperational = true;

  constructor(message: string = 'Unauthorized') {
    super(message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends Error implements AppError {
  statusCode = 403;
  isOperational = true;

  constructor(message: string = 'Forbidden') {
    super(message);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
