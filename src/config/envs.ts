import 'dotenv/config';

export const envs = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_change_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '3h',

  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587'),
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',

  APP_URL: process.env.APP_URL || 'http://localhost:3000',
};

if (!process.env.JWT_SECRET && envs.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET es requerido en producción');
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL es requerido');
}

if (envs.EMAIL_USER && !envs.EMAIL_PASS) {
  console.warn('EMAIL_USER configurado pero EMAIL_PASS faltante');
}
