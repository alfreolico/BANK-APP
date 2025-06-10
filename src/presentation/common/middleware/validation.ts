import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  body('password')
    .isLength({ min: 6, max: 20 })
    .withMessage('La contraseña debe tener entre 6 y 20 caracteres'),
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
];

export const validateTransaction = [
  body('receiver_account_number')
    .notEmpty()
    .withMessage('El número de cuenta del destinatario es requerido'),
  body('amount')
    .isFloat({ min: 1, max: 2000 })
    .withMessage('El monto debe estar entre $1 y $2000 pesos mexicanos'),
];

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Datos inválidos',
      details: errors.array(),
    });
    return;
  }
  next();
};
