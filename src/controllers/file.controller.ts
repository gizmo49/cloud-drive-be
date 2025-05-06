import { Request, Response } from 'express';
import FileService from '../services/file.service';
import { UserDocument } from '@/models/User';
import { _SUCCESS, _INTERNAL_ERROR, _NOT_FOUND } from '../utils/httpResponses';

export class FileController {
    private fileService: FileService;

    constructor() {
        this.fileService = new FileService();
    }

    async getAllFiles(req: Request, res: Response) {
        try {
            const { user } = req as Request & { user: UserDocument };
            const files = await this.fileService.getAllUserFiles(user?.id);
            _SUCCESS(res, files, 'Files retrieved successfully');

        } catch (error) {
            _INTERNAL_ERROR(res);
        }
    }

    async uploadFile(req: Request, res: Response) {
        try {
            const { user, file } = req as Request & { user: UserDocument };
            const { parentFolderId } = req.body;
            if (!file) throw new Error('No file uploaded');
            const uploadedFile = await this.fileService.uploadFile(file, user?.id, parentFolderId);

            return _SUCCESS(res, uploadedFile, 'File Uploaded successfully');
            
        } catch (error) {
            console.error(error);
            _INTERNAL_ERROR(res);
        }
    }

    async deleteFile(req: Request, res: Response) {
        try {
            const { user } = req as Request & { user: UserDocument };
            const result = await this.fileService.deleteFile(req.params.id, user?.id);
            _SUCCESS(res, result, 'File deleted successfully');
        } catch (error: any) {
            if (error.message === 'File not found') {
                return _NOT_FOUND(res, null, error.message);
            }
            return _INTERNAL_ERROR(res);
        }
    }
}
