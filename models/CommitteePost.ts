import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICommitteePost extends Document {
  name_en: string;
  name_bn: string;
  description_en?: string;
  description_bn?: string;
  sortOrder: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommitteePostSchema = new Schema<ICommitteePost>(
  {
    name_en: { type: String, required: true, trim: true },
    name_bn: { type: String, required: true, trim: true },
    description_en: { type: String, default: '', trim: true },
    description_bn: { type: String, default: '', trim: true },
    sortOrder: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isDefault: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const CommitteePost: Model<ICommitteePost> =
  mongoose.models.CommitteePost ||
  mongoose.model<ICommitteePost>('CommitteePost', CommitteePostSchema);
