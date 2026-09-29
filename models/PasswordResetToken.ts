import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPasswordResetToken extends Document {
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// TTL index to automatically clean up old tokens 24 hours after expiration
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

export const PasswordResetToken: Model<IPasswordResetToken> =
  (mongoose.models && mongoose.models.PasswordResetToken) ||
  mongoose.model<IPasswordResetToken>('PasswordResetToken', PasswordResetTokenSchema);
