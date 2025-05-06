import { uploadFile } from '../lib/aws.lib';
import { IFile, File } from '../models/File';
import { Folder } from '../models/Folder';

class FileService {

    async uploadFile(file: Express.Multer.File, userId: string, folderId?: string): Promise<IFile> {
        // Validate file size
        const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // Default 10MB
        if (file.size > maxFileSize) {
            throw new Error(`File size exceeds the limit of ${maxFileSize / (1024 * 1024)}MB`);
        }

        // Find and validate folder if folderId is provided
        let folder = null;
        if (folderId) {
            folder = await Folder.findOne({
                _id: folderId,
                owner: userId
            });
            if (!folder) {
                throw new Error('Folder not found');
            }
        }

        // Upload file to S3
        const uploadResult = await uploadFile(file, {
            bucketType: 'public',
            subfolder: folder ? `${userId}/${folder.name}` : `drive`
        });

        if (!uploadResult.success || !uploadResult.fileInfo) {
            throw new Error(uploadResult.error || 'Failed to upload file');
        }

        // Create and save file record
        const newFile = new File({
            owner: userId,
            url: uploadResult.url,
            s3URI: uploadResult.fileInfo.key,
            name: uploadResult.fileInfo.originalName,
            folder: folder?._id,
            mimetype: uploadResult.fileInfo.mimeType,
            size: uploadResult.fileInfo.size,
        });

        return await newFile.save();
    }

    async getAllUserFiles(userId: string) {
        return await File.find({ userId });
    }

    async createFile(fileData: {
        name: string;
        size: number;
        type: string;
        path: string;
        userId: string;
    }) {
        const file = new File(fileData);
        await file.save();
        return file;
    }

    async deleteFile(fileId: string, userId: string) {
        const file = await File.findOne({
            _id: fileId,
            userId
        });

        if (!file) {
            throw new Error('File not found');
        }

        await file.deleteOne();
        return { message: 'File deleted successfully' };
    }
}

export default FileService;