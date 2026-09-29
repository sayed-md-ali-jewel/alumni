import mongoose, { Schema, Document, Model } from 'mongoose';

export type CampaignCategory =
  | 'Scholarship'
  | 'Infrastructure'
  | 'Medical'
  | 'Relief'
  | 'General'
  | 'Endowment'
  | 'Sports'
  | 'Technology';

export type CampaignStatus = 'active' | 'completed' | 'paused' | 'draft';

export interface ICampaign extends Document {
  title_en: string;
  title_bn: string;
  description_en: string;
  description_bn: string;
  goal: number;
  raised: number;
  category: CampaignCategory;
  image?: string;
  startDate?: Date;
  endDate?: Date;
  status: CampaignStatus;
  isFeatured: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    title_en: { type: String, required: true, trim: true },
    title_bn: { type: String, required: true, trim: true },
    description_en: { type: String, required: true },
    description_bn: { type: String, required: true },
    goal: { type: Number, required: true, min: 1000 },
    raised: { type: Number, default: 0, min: 0 },
    category: {
      type: String,
      enum: [
        'Scholarship',
        'Infrastructure',
        'Medical',
        'Relief',
        'General',
        'Endowment',
        'Sports',
        'Technology',
      ],
      default: 'Scholarship',
    },
    image: { type: String, trim: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'draft'],
      default: 'active',
      index: true,
    },
    isFeatured: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Campaign: Model<ICampaign> =
  (mongoose.models && mongoose.models.Campaign) ||
  mongoose.model<ICampaign>('Campaign', CampaignSchema);

export const INITIAL_CAMPAIGNS = [
  {
    title_en: 'Student Scholarship Endowment Fund',
    title_bn: 'মেধাবী ও অসচ্ছল শিক্ষার্থী শিক্ষাবৃত্তি তহবিল',
    description_en: 'Sponsoring full undergraduate tuition and living stipends for talented students in need.',
    description_bn: 'অসচ্ছল শিক্ষার্থীদের বার্ষিক পূর্ণ টিউশন ফি এবং মাসিক শিক্ষা ভাতা অনুদান।',
    goal: 1000000,
    category: 'Scholarship',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop',
    status: 'active',
    isFeatured: true,
  },
  {
    title_en: 'Smart Classroom & AI Lab Renovation',
    title_bn: 'স্মার্ট ক্লাসরুম ও অত্যাধুনিক এআই ল্যাব উন্নয়ন',
    description_en: 'Equipping computing labs with GPU servers and modern interactive tech tools.',
    description_bn: 'আধুনিক জিপিইউ সার্ভার ও রোবোটিক্স ল্যাব উন্নয়ন।',
    goal: 750000,
    category: 'Infrastructure',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1200&auto=format&fit=crop',
    status: 'active',
    isFeatured: true,
  },
  {
    title_en: 'Emergency Student Medical Relief Fund',
    title_bn: 'জরুরি শিক্ষার্থী চিকিৎসা সহায়তা তহবিল',
    description_en: 'Providing immediate medical subsidies for students during severe health emergencies.',
    description_bn: 'অপ্রত্যাশিত দুর্ঘটনা ও জটিল রোগের জরুরি চিকিৎসা অনুদান।',
    goal: 500000,
    category: 'Medical',
    image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=1200&auto=format&fit=crop',
    status: 'active',
    isFeatured: false,
  },
];
