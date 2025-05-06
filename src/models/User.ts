import mongoose, { Document, HydratedDocument, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  storageUsed: number;
}

export type UserDocument = HydratedDocument<IUser>;


const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    storageUsed: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);