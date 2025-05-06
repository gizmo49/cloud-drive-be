import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }
      next(error);
    }
  };
};

// Auth validation schemas
export const registerSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6)
});

export const loginSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required()
});

// File validation schema
export const fileUploadSchema = Joi.object({
  parentFolderId: Joi.string().allow(null, '')
});

// Folder validation schema
export const folderSchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  parentFolderId: Joi.string().allow(null, '')
});