import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../errors';
import { logger } from '../../../utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof CustomError) {
    const { statusCode, message, logging, context } = error;

    if (logging) {
      logger.error('Error personalizado:', {
        error: message,
        statusCode,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        context,
        stack: error.stack,
      });
    }

    res.status(statusCode).json({
      error: message,
      timestamp: new Date().toISOString(),
      path: req.path,
      ...(process.env.NODE_ENV === 'development' && { context }),
    });
    return;
  }

  if (error.name === 'ValidationError') {
    logger.warn('Error de validación:', {
      error: error.message,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });

    res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: error.message,
      timestamp: new Date().toISOString(),
      path: req.path,
    });
    return;
  }

  if (error.name === 'JsonWebTokenError') {
    logger.warn('Error de JWT:', {
      error: error.message,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });

    res.status(401).json({
      error: 'Token inválido',
      timestamp: new Date().toISOString(),
      path: req.path,
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    logger.warn('Token expirado:', {
      error: error.message,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });

    res.status(401).json({
      error: 'Token expirado',
      timestamp: new Date().toISOString(),
      path: req.path,
    });
    return;
  }

  if (
    error.name === 'QueryFailedError' ||
    error.name === 'EntityNotFoundError'
  ) {
    logger.error('Error de base de datos:', {
      error: error.message,
      path: req.path,
      method: req.method,
      ip: req.ip,
      stack: error.stack,
    });

    res.status(500).json({
      error: 'Error interno del servidor',
      timestamp: new Date().toISOString(),
      path: req.path,
      ...(process.env.NODE_ENV === 'development' && {
        details: error.message,
      }),
    });
    return;
  }

  logger.error('Error no manejado:', {
    error: error.message,
    name: error.name,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: error.stack,
  });

  res.status(500).json({
    error: 'Error interno del servidor',
    timestamp: new Date().toISOString(),
    path: req.path,
    ...(process.env.NODE_ENV === 'development' && {
      details: error.message,
      stack: error.stack,
    }),
  });
};
