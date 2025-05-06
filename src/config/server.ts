import express from 'express';
import cors from 'cors';

export const createServer = () => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());


  return app;
};

export const startServer = (app: express.Application) => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};