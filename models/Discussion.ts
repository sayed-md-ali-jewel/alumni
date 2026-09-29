import mongoose, { Schema, Document, Model } from 'mongoose';
import { AlumniGroup, ALUMNI_GROUPS } from '@/lib/types';

export interface IComment {
  userId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface IDiscussion extends Document {
  authorId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  group?: AlumniGroup;
  batchYear?: number;
  category: 'General' | 'Batch' | 'Group' | 'Career' | 'Startups';
  likes: mongoose.Types.ObjectId[];
  comments: IComment[];
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const DiscussionSchema = new Schema<IDiscussion>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    group: { type: String, enum: ALUMNI_GROUPS, index: true },
    batchYear: { type: Number, index: true },
    category: {
      type: String,
      enum: ['General', 'Batch', 'Group', 'Career', 'Startups'],
      default: 'General',
      index: true,
    },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [CommentSchema],
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Discussion: Model<IDiscussion> =
  mongoose.models.Discussion ||
  mongoose.model<IDiscussion>('Discussion', DiscussionSchema);
