import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISliderItem extends Document {
  title_en: string;
  title_bn: string;
  subtitle_en?: string;
  subtitle_bn?: string;
  description_en: string;
  description_bn: string;
  buttonText_en?: string;
  buttonText_bn?: string;
  buttonLink?: string;
  secondaryButtonText_en?: string;
  secondaryButtonText_bn?: string;
  secondaryButtonLink?: string;
  image?: string;
  badge_en?: string;
  badge_bn?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const SliderItemSchema = new Schema<ISliderItem>(
  {
    title_en: { type: String, required: true, trim: true },
    title_bn: { type: String, required: true, trim: true },
    subtitle_en: { type: String, default: '', trim: true },
    subtitle_bn: { type: String, default: '', trim: true },
    description_en: { type: String, required: true, trim: true },
    description_bn: { type: String, required: true, trim: true },
    buttonText_en: { type: String, default: 'Explore Directory', trim: true },
    buttonText_bn: { type: String, default: 'প্রাক্তনদের খুঁজুন', trim: true },
    buttonLink: { type: String, default: '/directory', trim: true },
    secondaryButtonText_en: { type: String, default: 'Support Endowment', trim: true },
    secondaryButtonText_bn: { type: String, default: 'তহবিলে অনুদান দিন', trim: true },
    secondaryButtonLink: { type: String, default: '/donate', trim: true },
    image: { type: String, default: '', trim: true },
    badge_en: { type: String, default: 'The Premier Global Network for Our Alumni', trim: true },
    badge_bn: { type: String, default: 'বিশ্বব্যাপী প্রাক্তন শিক্ষার্থীদের সর্ববৃহৎ প্ল্যাটফর্ম', trim: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

export const SliderItem: Model<ISliderItem> =
  mongoose.models.SliderItem ||
  mongoose.model<ISliderItem>('SliderItem', SliderItemSchema);
