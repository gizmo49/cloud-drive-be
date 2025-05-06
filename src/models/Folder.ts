import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFolder extends Document {
  name: string;
  owner: Types.ObjectId;
  parent?: Types.ObjectId;
}

const FolderSchema = new Schema<IFolder>(
  {
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Folder', default: null },
  },
  { timestamps: true }
);

export const Folder = mongoose.model<IFolder>('Folder', FolderSchema);