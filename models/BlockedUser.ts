import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlockedUser extends Document {
  blockerId: mongoose.Types.ObjectId;
  blockedUserId: mongoose.Types.ObjectId;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlockedUserSchema = new Schema<IBlockedUser>(
  {
    blockerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    blockedUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reason: { type: String, trim: true },
  },
  { timestamps: true }
);

BlockedUserSchema.index({ blockerId: 1, blockedUserId: 1 }, { unique: true });
BlockedUserSchema.index({ blockedUserId: 1 });

export const BlockedUser: Model<IBlockedUser> =
  mongoose.models.BlockedUser || mongoose.model<IBlockedUser>('BlockedUser', BlockedUserSchema);
