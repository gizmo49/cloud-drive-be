import mongoose from 'mongoose';
import { File } from '../models/File';
import { Folder } from '../models/Folder';

class FolderService {
    async getAllUserFolders(owner: string) {

        const rootFolders = await Folder.aggregate([
            {
                $match: { parent: null } // Only root folders
            },
            {
                $lookup: {
                    from: 'files',
                    localField: '_id',
                    foreignField: 'folder',
                    as: 'files'
                }
            },
            {
                $project: {
                    name: 1,
                    owner: 1,
                    createdAt: 1,
                    fileCount: { $size: '$files' },
                    totalFileSize: {
                        $cond: {
                            if: { $gt: [{ $size: '$files' }, 0] },
                            then: { $sum: '$files.size' },
                            else: 0
                        }
                    }
                }
            }
        ]);

        // Get 5 most recent files
        const recentFiles = await File.find({ owner })
            .sort({ createdAt: -1 })
            .limit(5);

        return {
            folders: rootFolders,
            files: recentFiles
        };
    }


    async getFolder(folderId: string, owner: string) {
        const folder = await Folder.findOne({
            _id: folderId,
            owner
        });

        if (!folder) {
            throw new Error('Folder not found');
        }

        return folder;
    }

    async createFolder(folderData: {
        name: string;
        parent: string;
        userId: string;
    }) {
        // Check for existing folders with the same name under the same parent
        const existingFolder = await Folder.findOne({
            name: new RegExp(`^${folderData.name}(?:\s\(\d+\))?$`),
            parent: folderData.parent || null,
            owner: folderData.userId
        });

        if (existingFolder) {
            // If a folder with the same name exists, append a number
            const folders = await Folder.find({
                name: new RegExp(`^${folderData.name}(?:\s\(\d+\))?$`),
                parent: folderData.parent || null,
                owner: folderData.userId
            });

            const numbers = folders.map(f => {
                const match = f.name.match(/\((\d+)\)$/);
                return match ? parseInt(match[1]) : 0;
            });

            const nextNumber = Math.max(...numbers, 0) + 1;
            folderData.name = `${folderData.name} (${nextNumber})`;
        }

        const folder = new Folder({ ...folderData, owner: folderData.userId });
        await folder.save();
        return folder;
    }

    async getSpecificFolder(folderId: string, owner: string) {

        const folderObjId = new mongoose.Types.ObjectId(folderId);
        const ownerObjId = new mongoose.Types.ObjectId(owner);

        const folder = await Folder.aggregate([
            {
              $match: { _id: folderObjId, owner: ownerObjId  }
            },
            {
              $lookup: {
                from: 'files',
                localField: '_id',
                foreignField: 'folder',
                as: 'files'
              }
            },
            {
              $lookup: {
                from: 'folders',
                localField: '_id',
                foreignField: 'parent',
                as: 'subFolders'
              }
            },
            {
              $graphLookup: {
                from: 'folders',
                startWith: '$parent',
                connectFromField: 'parent',
                connectToField: '_id',
                as: 'breadcrumb',
                depthField: 'level'
              }
            },
            {
              $project: {
                name: 1,
                path: 1,
                owner: 1,
                createdAt: 1,
                files: 1,
                subFolders: 1,
                breadcrumb: {
                  $reverseArray: '$breadcrumb' // To show path from root -> current
                },
                fileCount: { $size: '$files' },
                totalFileSize: {
                  $cond: {
                    if: { $gt: [{ $size: '$files' }, 0] },
                    then: { $sum: '$files.size' },
                    else: 0
                  }
                }
              }
            }
          ]);

        if (!folder) {
            throw new Error('Folder not found');
        }

        return folder;
    }

    async deleteFolder(folderId: string, owner: string) {
        const folder = await Folder.findOne({
            _id: folderId,
            owner
        });

        if (!folder) {
            throw new Error('Folder not found');
        }

        await folder.deleteOne();
        return { message: 'Folder deleted successfully' };
    }
}


export default FolderService;