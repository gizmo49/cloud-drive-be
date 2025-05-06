import dotenv from 'dotenv';
import { createServer, startServer } from './config/server';
import { connectDatabase } from './config/database';
import { configureRoutes } from './config/routes';
import 'module-alias/register';

// Load environment variables
dotenv.config();

// Create Express app
const app = createServer();

// Configure routes
configureRoutes(app);

// Connect to database and start server
connectDatabase()
  .then(() => {
    startServer(app);
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });

export default app;