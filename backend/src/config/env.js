/**
 * Loads environment variables from .env into process.env.
 * This file must be imported BEFORE anything reads process.env.
 * We fail fast if a critical variable is missing.
 */
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(import.meta.dirname, '..', '..', '.env'),
  quiet: true,
});

const requiredVariables = ['PORT', 'JWT_SECRET'];

for (const key of requiredVariables) {
  if (!process.env[key]) {
    console.error(`[config] Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

export const port = Number(process.env.PORT);
export const nodeEnv = process.env.NODE_ENV || 'development';
export const jwtSecret = process.env.JWT_SECRET;
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
export const frontendOrigin =
  process.env.FRONTEND_ORIGIN || 'http://localhost:5173';