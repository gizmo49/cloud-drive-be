import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFile extends Document {
  name: string;
  mimetype: string;
  size: number; // bytes
  url: string;
  s3URI: string
  owner: Types.ObjectId;
  folder?: Types.ObjectId;
}

const FileSchema = new Schema<IFile>(
  {
    name: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    s3URI: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    folder: { type: Schema.Types.ObjectId, ref: 'Folder', default: null }
  },
  { timestamps: true }
);

export const File = mongoose.model<IFile>('File', FileSchema);