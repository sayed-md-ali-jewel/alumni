import mongoose, { Schema, Document, Model } from 'mongoose';
import { DEFAULT_SITE_SETTINGS, SiteSettings } from '@/lib/siteSettings';

export { DEFAULT_SITE_SETTINGS };
export type { SiteSettings };

export interface ISiteSetting extends Document, SiteSettings {
  key: string;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingSchema = new Schema<ISiteSetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'site_settings',
      index: true,
    },
    // Header & Brand Settings
    siteName_en: { type: String, default: DEFAULT_SITE_SETTINGS.siteName_en, trim: true },
    siteName_bn: { type: String, default: DEFAULT_SITE_SETTINGS.siteName_bn, trim: true },
    tagline_en: { type: String, default: DEFAULT_SITE_SETTINGS.tagline_en, trim: true },
    tagline_bn: { type: String, default: DEFAULT_SITE_SETTINGS.tagline_bn, trim: true },
    logoUrl: { type: String, default: '', trim: true },
    faviconUrl: { type: String, default: '', trim: true },

    // Footer Settings
    footerTagline_en: { type: String, default: DEFAULT_SITE_SETTINGS.footerTagline_en, trim: true },
    footerTagline_bn: { type: String, default: DEFAULT_SITE_SETTINGS.footerTagline_bn, trim: true },
    about_en: { type: String, default: DEFAULT_SITE_SETTINGS.about_en, trim: true },
    about_bn: { type: String, default: DEFAULT_SITE_SETTINGS.about_bn, trim: true },
    address: { type: String, default: DEFAULT_SITE_SETTINGS.address, trim: true },
    phone: { type: String, default: DEFAULT_SITE_SETTINGS.phone, trim: true },
    email: { type: String, default: DEFAULT_SITE_SETTINGS.email, trim: true },
    copyright_en: { type: String, default: DEFAULT_SITE_SETTINGS.copyright_en, trim: true },
    copyright_bn: { type: String, default: DEFAULT_SITE_SETTINGS.copyright_bn, trim: true },

    // Social Links
    facebookUrl: { type: String, default: DEFAULT_SITE_SETTINGS.facebookUrl, trim: true },
    linkedinUrl: { type: String, default: DEFAULT_SITE_SETTINGS.linkedinUrl, trim: true },
    youtubeUrl: { type: String, default: DEFAULT_SITE_SETTINGS.youtubeUrl, trim: true },
    websiteUrl: { type: String, default: DEFAULT_SITE_SETTINGS.websiteUrl, trim: true },
    twitterUrl: { type: String, default: '', trim: true },
    instagramUrl: { type: String, default: '', trim: true },
    whatsappUrl: { type: String, default: '', trim: true },
    whatsappNumber: { type: String, default: '', trim: true },

    // Community Footer Badge
    communityName_en: { type: String, default: DEFAULT_SITE_SETTINGS.communityName_en, trim: true },
    communityName_bn: { type: String, default: DEFAULT_SITE_SETTINGS.communityName_bn, trim: true },
    customPrefix_en: { type: String, default: DEFAULT_SITE_SETTINGS.customPrefix_en, trim: true },
    customPrefix_bn: { type: String, default: DEFAULT_SITE_SETTINGS.customPrefix_bn, trim: true },
    customFor_en: { type: String, default: DEFAULT_SITE_SETTINGS.customFor_en, trim: true },
    customFor_bn: { type: String, default: DEFAULT_SITE_SETTINGS.customFor_bn, trim: true },
    showCommunityBadge: { type: Boolean, default: true },
    showSocialBadges: { type: Boolean, default: true },

    // Manual Donation Payment Configuration
    bkashNumber: { type: String, default: DEFAULT_SITE_SETTINGS.bkashNumber, trim: true },
    bkashType: { type: String, default: DEFAULT_SITE_SETTINGS.bkashType, trim: true },
    bkashInstructions_en: { type: String, default: DEFAULT_SITE_SETTINGS.bkashInstructions_en },
    bkashInstructions_bn: { type: String, default: DEFAULT_SITE_SETTINGS.bkashInstructions_bn },
    isBkashEnabled: { type: Boolean, default: true },

    nagadNumber: { type: String, default: DEFAULT_SITE_SETTINGS.nagadNumber, trim: true },
    nagadType: { type: String, default: DEFAULT_SITE_SETTINGS.nagadType, trim: true },
    nagadInstructions_en: { type: String, default: DEFAULT_SITE_SETTINGS.nagadInstructions_en },
    nagadInstructions_bn: { type: String, default: DEFAULT_SITE_SETTINGS.nagadInstructions_bn },
    isNagadEnabled: { type: Boolean, default: true },

    cashInstructions_en: { type: String, default: DEFAULT_SITE_SETTINGS.cashInstructions_en },
    cashInstructions_bn: { type: String, default: DEFAULT_SITE_SETTINGS.cashInstructions_bn },
    isCashEnabled: { type: Boolean, default: true },

    // Slider settings
    isSliderEnabled: { type: Boolean, default: true },
    sliderShowTitle: { type: Boolean, default: true },
    sliderShowDescription: { type: Boolean, default: true },
    sliderShowButton: { type: Boolean, default: true },

    // Hero Header Section (Home Banner)
    heroBadge_en: { type: String, default: DEFAULT_SITE_SETTINGS.heroBadge_en, trim: true },
    heroBadge_bn: { type: String, default: DEFAULT_SITE_SETTINGS.heroBadge_bn, trim: true },
    heroTitle_en: { type: String, default: DEFAULT_SITE_SETTINGS.heroTitle_en, trim: true },
    heroTitle_bn: { type: String, default: DEFAULT_SITE_SETTINGS.heroTitle_bn, trim: true },
    heroSubtitle_en: { type: String, default: DEFAULT_SITE_SETTINGS.heroSubtitle_en, trim: true },
    heroSubtitle_bn: { type: String, default: DEFAULT_SITE_SETTINGS.heroSubtitle_bn, trim: true },
    heroPrimaryBtnText_en: { type: String, default: DEFAULT_SITE_SETTINGS.heroPrimaryBtnText_en, trim: true },
    heroPrimaryBtnText_bn: { type: String, default: DEFAULT_SITE_SETTINGS.heroPrimaryBtnText_bn, trim: true },
    heroPrimaryBtnLink: { type: String, default: DEFAULT_SITE_SETTINGS.heroPrimaryBtnLink, trim: true },
    heroSecondaryBtnText_en: { type: String, default: DEFAULT_SITE_SETTINGS.heroSecondaryBtnText_en, trim: true },
    heroSecondaryBtnText_bn: { type: String, default: DEFAULT_SITE_SETTINGS.heroSecondaryBtnText_bn, trim: true },
    heroSecondaryBtnLink: { type: String, default: DEFAULT_SITE_SETTINGS.heroSecondaryBtnLink, trim: true },
    heroShowStats: { type: Boolean, default: true },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const SiteSetting: Model<ISiteSetting> =
  (mongoose.models && mongoose.models.SiteSetting) ||
  mongoose.model<ISiteSetting>('SiteSetting', SiteSettingSchema);
