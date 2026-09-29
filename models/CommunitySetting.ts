import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICommunitySetting extends Document {
  key: string;
  communityName_en: string;
  communityName_bn: string;
  whatsappUrl: string;
  whatsappNumber?: string;
  facebookUrl: string;
  websiteUrl?: string;
  customPrefix_en: string;
  customPrefix_bn: string;
  customFor_en: string;
  customFor_bn: string;
  enabled: boolean;
  showSocialBadges: boolean;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommunitySettingSchema = new Schema<ICommunitySetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'community_footer',
      index: true,
    },
    communityName_en: {
      type: String,
      default: 'our Alumni Community',
      trim: true,
    },
    communityName_bn: {
      type: String,
      default: 'আমাদের অ্যালামনাই কমিউনিটি',
      trim: true,
    },
    whatsappUrl: {
      type: String,
      default: '',
      trim: true,
    },
    whatsappNumber: {
      type: String,
      default: '',
      trim: true,
    },
    facebookUrl: {
      type: String,
      default: '',
      trim: true,
    },
    websiteUrl: {
      type: String,
      default: '',
      trim: true,
    },
    customPrefix_en: {
      type: String,
      default: 'Built with',
      trim: true,
    },
    customPrefix_bn: {
      type: String,
      default: 'ভালোবাসা দিয়ে নির্মিত',
      trim: true,
    },
    customFor_en: {
      type: String,
      default: 'for',
      trim: true,
    },
    customFor_bn: {
      type: String,
      default: 'আমাদের',
      trim: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    showSocialBadges: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const CommunitySetting: Model<ICommunitySetting> =
  mongoose.models.CommunitySetting ||
  mongoose.model<ICommunitySetting>('CommunitySetting', CommunitySettingSchema);
