import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest, registerSchema, loginSchema } from '../middleware/validationMiddleware';

const router = Router();
const authController = new AuthController();

// Auth routes
router
  .post('/register', validateRequest(registerSchema), authController.register.bind(authController))
  .post('/login', validateRequest(loginSchema), authController.login.bind(authController));

export default router;