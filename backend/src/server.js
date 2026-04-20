import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { getDb } from './db/database.js';
import { initializeDatabase } from './db/init.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import expensesRoutes from './routes/expensesRoutes.js';
import invoicesRoutes from './routes/invoicesRoutes.js';
import patientsRoutes from './routes/patientsRoutes.js';
import productsRoutes from './routes/productsRoutes.js';
import servicesRoutes from './routes/servicesRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export const createServer = () => {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: env.frontendUrl }));
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/patients', patientsRoutes);
  app.use('/api/services', servicesRoutes);
  app.use('/api/products', productsRoutes);
  app.use('/api/invoices', invoicesRoutes);
  app.use('/api/expenses', expensesRoutes);

  app.use(errorHandler);

  return app;
};

export const startServer = async () => {
  await initializeDatabase();
  await getDb();

  const app = createServer();

  return new Promise((resolve, reject) => {
    const server = app.listen(env.port, () => {
      console.log(`Backend running on http://localhost:${env.port}`);
      resolve(server);
    });

    server.on('error', reject);
  });
};

if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  startServer().catch((error) => {
    console.error('Server failed to start', error);
    process.exit(1);
  });
}
