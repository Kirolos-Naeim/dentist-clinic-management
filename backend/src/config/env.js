import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const defaultFrontendUrl = process.env.NODE_ENV === 'production'
  ? 'app://-'
  : 'http://localhost:5173';

export const env = {
  port: Number(process.env.PORT || 4000),
  dbPath: process.env.DB_PATH || path.join('database', 'clinic.sqlite'),
  frontendUrl: process.env.FRONTEND_URL || defaultFrontendUrl,
  nodeEnv: process.env.NODE_ENV || 'development',
};
