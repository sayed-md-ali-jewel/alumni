import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  AlumniGroup,
  BloodGroup,
  DonationStatus,
  ContactPreference,
  ALUMNI_GROUPS,
  BLOOD_GROUPS,
  DONATION_STATUSES,
  CONTACT_PREFERENCES,
} from '@/lib/types';

export interface IAlumniProfile extends Document {
  userId: mongoose.Types.ObjectId;
  batchYear: number;
  group: AlumniGroup;
  bloodGroup?: BloodGroup;
  company?: string;
  jobTitle?: string;
  location?: string;
  presentAddress?: string;
  permanentAddress?: string;
  bio?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
  skills: string[];
  phone?: string;
  visibility: 'public' | 'alumni_only';
  contactPrivacy?: {
    email?: 'public' | 'private';
    phone?: 'public' | 'private';
    whatsapp?: 'public' | 'private';
    facebook?: 'public' | 'private';
    linkedin?: 'public' | 'private';
    instagram?: 'public' | 'private';
  };

  // Blood Donation System
  isBloodDonor: boolean;
  donationStatus: DonationStatus;
  lastDonationDate?: Date;
  nextEligibleDate?: Date;
  donorLocation?: string;
  contactPreference: ContactPreference;
  donorNotes?: string;
  bloodDonationConsent: boolean;
  allowAlumniContact: boolean;

  // Committee Designation System
  committeePost?: mongoose.Types.ObjectId;
  committeeRoleTitle?: string;
  isChatEnabled?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const ContactPrivacySchema = new Schema(
  {
    email: { type: String, enum: ['public', 'private'], default: 'public' },
    phone: { type: String, enum: ['public', 'private'], default: 'public' },
    whatsapp: { type: String, enum: ['public', 'private'], default: 'public' },
    facebook: { type: String, enum: ['public', 'private'], default: 'public' },
    linkedin: { type: String, enum: ['public', 'private'], default: 'public' },
    instagram: { type: String, enum: ['public', 'private'], default: 'public' },
  },
  { _id: false }
);

const AlumniProfileSchema = new Schema<IAlumniProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    batchYear: { type: Number, required: true, index: true },
    group: {
      type: String,
      enum: ALUMNI_GROUPS,
      required: true,
      index: true,
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      index: true,
    },
    company: { type: String, default: '' },
    jobTitle: { type: String, default: '' },
    location: { type: String, default: 'Dhaka, Bangladesh', index: true },
    presentAddress: { type: String, default: '' },
    permanentAddress: { type: String, default: '' },
    bio: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    skills: { type: [String], default: [] },
    phone: { type: String, default: '' },
    visibility: {
      type: String,
      enum: ['public', 'alumni_only'],
      default: 'public',
    },
    contactPrivacy: {
      type: ContactPrivacySchema,
      default: () => ({
        email: 'public',
        phone: 'public',
        whatsapp: 'public',
        facebook: 'public',
        linkedin: 'public',
        instagram: 'public',
      }),
    },

    // Blood Donation fields
    isBloodDonor: { type: Boolean, default: false, index: true },
    donationStatus: {
      type: String,
      enum: DONATION_STATUSES,
      default: DonationStatus.AVAILABLE,
      index: true,
    },
    lastDonationDate: { type: Date },
    nextEligibleDate: { type: Date },
    donorLocation: { type: String, default: 'Chattogram, Bangladesh' },
    contactPreference: {
      type: String,
      enum: CONTACT_PREFERENCES,
      default: ContactPreference.BOTH,
    },
    donorNotes: { type: String, default: '' },
    bloodDonationConsent: { type: Boolean, default: false, index: true },
    allowAlumniContact: { type: Boolean, default: true },

    // Committee Designation Reference
    committeePost: {
      type: Schema.Types.ObjectId,
      ref: 'CommitteePost',
      index: true,
    },
    committeeRoleTitle: { type: String, default: '' },
    isChatEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound indexes for optimal queries
AlumniProfileSchema.index({
  bloodGroup: 1,
  isBloodDonor: 1,
  donationStatus: 1,
  bloodDonationConsent: 1,
});

AlumniProfileSchema.index({
  group: 1,
  batchYear: 1,
});

// Text index for search
AlumniProfileSchema.index({
  company: 'text',
  jobTitle: 'text',
  group: 'text',
  location: 'text',
  skills: 'text',
  bio: 'text',
  donorLocation: 'text',
});

if (mongoose.models && mongoose.models.AlumniProfile) {
  delete (mongoose.models as any).AlumniProfile;
}

export const AlumniProfile: Model<IAlumniProfile> =
  mongoose.models.AlumniProfile ||
  mongoose.model<IAlumniProfile>('AlumniProfile', AlumniProfileSchema);
