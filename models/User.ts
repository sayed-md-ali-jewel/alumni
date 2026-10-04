import mongoose, { Schema, Document, Model } from 'mongoose';
import { BloodGroup, BLOOD_GROUPS } from '@/lib/types';

export type UserRole = 'admin' | 'alumni' | 'guest';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  image?: string;
  isVerified: boolean;
  isChatEnabled?: boolean;
  phone?: string;
  bloodGroup?: BloodGroup;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String },
    role: {
      type: String,
      enum: ['admin', 'alumni', 'guest'],
      default: 'alumni',
    },
    image: { type: String },
    isVerified: { type: Boolean, default: false },
    isChatEnabled: { type: Boolean, default: true },
    phone: { type: String },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
    },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
