import mongoose, { Schema, Document, Model } from 'mongoose';
import { MessageContentType, MESSAGE_CONTENT_TYPES, UserRequestStatus, USER_REQUEST_STATUSES } from '@/lib/types';

export interface IUserRequest extends Document {
  senderId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  contentType: MessageContentType;
  message: string;
  imageUrl?: string;
  voiceUrl?: string;
  type?: string;
  subject?: string;
  date: string;
  time: string;
  status: UserRequestStatus;
  read: boolean;
  readAt?: Date;
  responseMessage?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const UserRequestSchema = new Schema<IUserRequest>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    contentType: {
      type: String,
      enum: MESSAGE_CONTENT_TYPES,
      default: MessageContentType.TEXT,
      required: true,
      index: true,
    },
    message: { type: String, default: '', trim: true },
    imageUrl: { type: String, trim: true },
    voiceUrl: { type: String, trim: true },
    type: { type: String, trim: true },
    subject: { type: String, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: USER_REQUEST_STATUSES,
      default: UserRequestStatus.PENDING,
      index: true,
    },
    read: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    responseMessage: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

UserRequestSchema.index({ recipientId: 1, createdAt: -1 });
UserRequestSchema.index({ senderId: 1, createdAt: -1 });
UserRequestSchema.index({ recipientId: 1, read: 1 });
UserRequestSchema.index({ senderId: 1, recipientId: 1 });

export const UserRequest: Model<IUserRequest> =
  mongoose.models.UserRequest || mongoose.model<IUserRequest>('UserRequest', UserRequestSchema);
