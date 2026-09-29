import mongoose, { Schema, Document, Model } from 'mongoose';

export type JobType = 'full_time' | 'part_time' | 'remote' | 'internship' | 'contract';

export interface IJobPost extends Document {
  title: string;
  company: string;
  location: string;
  type: JobType;
  salaryRange?: string;
  description: string;
  requirements?: string[];
  applicationUrl?: string;
  contactEmail?: string;
  isReferral: boolean;
  postedBy: mongoose.Types.ObjectId;
  deadline?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JobPostSchema = new Schema<IJobPost>(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    type: {
      type: String,
      enum: ['full_time', 'part_time', 'remote', 'internship', 'contract'],
      default: 'full_time',
    },
    salaryRange: { type: String, default: 'Negotiable' },
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    applicationUrl: { type: String },
    contactEmail: { type: String },
    isReferral: { type: Boolean, default: false },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deadline: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const JobPost: Model<IJobPost> =
  mongoose.models.JobPost || mongoose.model<IJobPost>('JobPost', JobPostSchema);
