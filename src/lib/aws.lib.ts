import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl as awsGetSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";

// Initialize S3 client once
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Bucket configuration
const buckets = {
  public: process.env.AWS_BUCKET_NAME!,
  private: process.env.AWS_S3_PRIVATE_BUCKET_NAME!
};

// Base URL for public bucket (no need for signed URLs)
const publicBucketBaseUrl = `https://${buckets.public}.s3.${process.env.AWS_REGION!}.amazonaws.com`;

/**
 * Generates a unique filename to prevent overwriting existing files
 * @param originalFilename - The original filename
 * @returns A unique filename with timestamp and random hash
 */
const generateUniqueFilename = (originalFilename: string): string => {
  const timestamp = Date.now();
  const randomHash = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalFilename);
  const baseName = path.basename(originalFilename, extension);

  return `${baseName}-${timestamp}-${randomHash}${extension}`;
};

/**
 * Builds the full object key including subfolder path
 * @param filename - The filename
 * @param subfolder - Optional subfolder path
 * @returns The complete S3 object key
 */
const buildObjectKey = (filename: string, subfolder?: string): string => {
  if (!subfolder) return filename;

  // Ensure subfolder doesn't have leading/trailing slashes
  const normalizedSubfolder = subfolder.replace(/^\/|\/$/g, '');
  return `${normalizedSubfolder}/${filename}`;
};

/**
 * Upload a file to S3
 * @param file - The file to upload
 * @param options - Upload options
 * @returns Upload result with file info
 */
export const uploadFile = async (
  file: Express.Multer.File,
  options: {
    bucketType?: 'public' | 'private';
    subfolder?: string;
    useOriginalFilename?: boolean;
    metadata?: Record<string, string>;
  } = {}
): Promise<{
  success: boolean;
  fileInfo?: {
    key: string;
    bucket: string;
    bucketType: 'public' | 'private';
    originalName: string;
    storedName: string;
    mimeType: string;
    size: number;
  };
  url?: string;
  error?: string;
}> => {
  try {
    const {
      bucketType = 'public',
      subfolder,
      useOriginalFilename = false,
      metadata = {}
    } = options;

    // Generate a unique filename or use original
    const filename = useOriginalFilename
      ? file.originalname
      : generateUniqueFilename(file.originalname);

    // Build full object key with subfolder if provided
    const objectKey = buildObjectKey(filename, subfolder);

    // Select bucket based on type
    const bucketName = buckets[bucketType];
 
    if (!bucketName) {
      throw new Error(`Invalid bucket type: ${bucketType}`);
    }

    const uploadParams = {
      Bucket: bucketName,
      Key: objectKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: metadata
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Return file information
    const fileInfo = {
      key: objectKey,
      bucket: bucketName,
      bucketType,
      originalName: file.originalname,
      storedName: filename,
      mimeType: file.mimetype,
      size: file.size
    };

    // For public files, also return the direct URL
    if (bucketType === 'public') {
      return {
        success: true,
        fileInfo,
        url: `${publicBucketBaseUrl}/${objectKey}`
      };
    }

    // For private files, return file info without URL (requires signed URL for access)
    return {
      success: true,
      fileInfo
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during upload'
    };
  }
};

/**
 * Generate a signed URL for accessing a private file
 * @param objectKey - The S3 object key
 * @param options - Options for generating the URL
 * @returns The signed URL
 */
export const generateSignedUrl = async (
  objectKey: string,
  options: {
    bucketType?: 'public' | 'private';
    expiresIn?: number; // Seconds
  } = {}
): Promise<{
  success: boolean;
  url?: string;
  expiresIn?: number | null;
  error?: string;
}> => {
  try {
    const {
      bucketType = 'private',
      expiresIn = 3600 // 1 hour default
    } = options;

    // If it's a public file, just return the direct URL
    if (bucketType === 'public') {
      return {
        success: true,
        url: `${publicBucketBaseUrl}/${objectKey}`,
        expiresIn: null // Never expires
      };
    }

    const bucketName = buckets[bucketType];

    if (!bucketName) {
      throw new Error(`Invalid bucket type: ${bucketType}`);
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    const url = await awsGetSignedUrl(s3Client, command, { expiresIn });

    return {
      success: true,
      url,
      expiresIn
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error generating URL'
    };
  }
};

/**
 * Delete a file from S3
 * @param objectKey - The S3 object key to delete
 * @param options - Delete options
 * @returns Delete result
 */
export const deleteFile = async (
  objectKey: string,
  options: {
    bucketType?: 'public' | 'private';
  } = {}
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> => {
  try {
    const { bucketType = 'public' } = options;
    const bucketName = buckets[bucketType];

    if (!bucketName) {
      throw new Error(`Invalid bucket type: ${bucketType}`);
    }

    const deleteParams = {
      Bucket: bucketName,
      Key: objectKey,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);

    return {
      success: true,
      message: `File ${objectKey} deleted successfully`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during deletion'
    };
  }
};

/**
 * Check if a file exists in S3
 * @param objectKey - The S3 object key to check
 * @param options - Options
 * @returns Whether the file exists
 */
export const fileExists = async (
  objectKey: string,
  options: {
    bucketType?: 'public' | 'private';
  } = {}
): Promise<{
  success: boolean;
  exists?: boolean;
  error?: string;
}> => {
  try {
    const { bucketType = 'public' } = options;
    const bucketName = buckets[bucketType];

    if (!bucketName) {
      throw new Error(`Invalid bucket type: ${bucketType}`);
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    await s3Client.send(command);
    return { success: true, exists: true };
  } catch (error: any) {
    if (error.name === 'NoSuchKey') {
      return { success: true, exists: false };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error checking file'
    };
  }
};