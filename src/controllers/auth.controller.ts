import { Request, Response } from 'express';
import AuthService from '../services/auth.service';
import { _SUCCESS, _BAD_REQUEST, _INTERNAL_ERROR } from '../utils/httpResponses';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async register(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.register(email, password);
      return _SUCCESS(res, result, 'User registered successfully');
    } catch (error: any) {
      console.log(error);
      if (error.message === 'User already exists') {
        return _BAD_REQUEST(res, null, error.message);
      }
      return _INTERNAL_ERROR(res);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      return _SUCCESS(res, result, 'Login successful');
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        return _BAD_REQUEST(res, null, error.message);
      }
      return _INTERNAL_ERROR(res);
    }
  }
}