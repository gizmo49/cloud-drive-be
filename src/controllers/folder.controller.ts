import { Request, Response } from 'express';
import FolderService from '../services/folder.service';
import { UserDocument } from '../models/User';
import { _SUCCESS, _INTERNAL_ERROR, _NOT_FOUND } from '../utils/httpResponses';

class FolderController {
    private folderService: FolderService;

    constructor() {
        this.folderService = new FolderService();
    }

    async getAllFolders(req: Request, res: Response) {
        try {
            const { user } = req as Request & { user: UserDocument };
            const result = await this.folderService.getAllUserFolders(user?.id);
            _SUCCESS(res, result, 'Folders and recent files retrieved successfully');
        } catch (error) {
            _INTERNAL_ERROR(res);
        }
    }

    async createFolder(req: Request, res: Response) {
        try {
            const { name, parentFolderId } = req.body;
            const { user } = req as Request & { user: UserDocument };
            
            let parent;
            if (parentFolderId) {
                const parentFolder = await this.folderService.getFolder(parentFolderId, user?.id);
                if (!parentFolder) {
                    _NOT_FOUND(res, null, 'Parent folder not found');
                    return;
                }
                parent = parentFolder._id;
            }

            const folder = await this.folderService.createFolder({
                name,
                parent,
                userId: user?._id
            });
            _SUCCESS(res, folder, 'Folder created successfully');
        } catch (error) {
            console.log(error);
            _INTERNAL_ERROR(res);
        }
    }

    async getSpecificFolder(req: Request, res: Response) {
        try {
            const { user } = req as Request & { user: UserDocument };
            const folder = await this.folderService.getSpecificFolder(req.params.id, user?.id);
            _SUCCESS(res, folder, 'Folder retrieved successfully');
        } catch (error: any) {
            if (error.message === 'Folder not found') {
                _NOT_FOUND(res, null, error.message);
            }
            _INTERNAL_ERROR(res);
        }
    }

    async deleteFolder(req: Request, res: Response) {
        try {
            const { user } = req as Request & { user: UserDocument };
            const result = await this.folderService.deleteFolder(req.params.id, user?.id);
            _SUCCESS(res, result, 'Folder deleted successfully');
        } catch (error: any) {
            if (error.message === 'Folder not found') {
                _NOT_FOUND(res, null, error.message);
            }
            _INTERNAL_ERROR(res);
        }
    }
}

export default FolderController;