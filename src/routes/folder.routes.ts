import { Router } from 'express';
import FolderController from '../controllers/folder.controller';
import { validateRequest, folderSchema } from '../middleware/validationMiddleware';

const router = Router();
const folderController = new FolderController();

router
  .get('/', folderController.getAllFolders.bind(folderController))
  .get('/:id', folderController.getSpecificFolder.bind(folderController))
  .post('/', validateRequest(folderSchema), folderController.createFolder.bind(folderController))
  .delete('/:id', folderController.deleteFolder.bind(folderController));

export default router;