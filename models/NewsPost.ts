import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INewsPost extends Document {
  title_bn: string;
  title_en: string;
  slug: string;
  content_bn: string;
  content_en: string;
  summary_bn?: string;
  summary_en?: string;
  category: 'Spotlight' | 'Announcement' | 'Achievement' | 'Campus' | 'Story';
  image?: string;
  authorId: mongoose.Types.ObjectId;
  views: number;
  allowSharing?: boolean;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NewsPostSchema = new Schema<INewsPost>(
  {
    title_bn: { type: String, required: true },
    title_en: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    content_bn: { type: String, required: true },
    content_en: { type: String, required: true },
    summary_bn: { type: String },
    summary_en: { type: String },
    category: {
      type: String,
      enum: ['Spotlight', 'Announcement', 'Achievement', 'Campus', 'Story'],
      default: 'Announcement',
    },
    image: { type: String },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    views: { type: Number, default: 0 },
    allowSharing: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const NewsPost: Model<INewsPost> =
  mongoose.models.NewsPost || mongoose.model<INewsPost>('NewsPost', NewsPostSchema);
