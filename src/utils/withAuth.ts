import { Request, Response } from 'express';
import { UserDocument } from '@/models/User';

type AuthenticatedHandler = (req: Request & { user: UserDocument }, res: Response) => Promise<void>;

export const withAuth = (handler: AuthenticatedHandler) => async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    return await handler(req as Request & { user: UserDocument }, res);
  } catch (error) {
    console.error('Error in authenticated handler:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};