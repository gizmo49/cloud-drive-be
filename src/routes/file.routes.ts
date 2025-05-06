import { Router } from 'express';
import multer from 'multer';
import { FileController } from '../controllers/file.controller';
import { validateRequest, fileUploadSchema } from '../middleware/validationMiddleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const fileController = new FileController();

router
  .get('/', fileController.getAllFiles.bind(fileController))
  .post('/', upload.single('file'),  validateRequest(fileUploadSchema), fileController.uploadFile.bind(fileController))
  .delete('/:id', fileController.deleteFile.bind(fileController));

export default router;