import { Express } from 'express';
import authRoutes from '../routes/auth.routes';
import fileRoutes from '../routes/file.routes';
import folderRoutes from '../routes/folder.routes';
import { isAuth } from '../middleware/authMiddleware';

export const configureRoutes = (app: Express): void => {
  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/files', isAuth, fileRoutes);
  app.use('/api/folders', isAuth,  folderRoutes);
};