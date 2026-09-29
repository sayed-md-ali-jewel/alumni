import mongoose, { Schema, Document, Model } from 'mongoose';
import { BloodGroup, BLOOD_GROUPS } from '@/lib/types';

export interface IBloodDonation extends Document {
  donorId: mongoose.Types.ObjectId;
  bloodRequestId?: mongoose.Types.ObjectId;
  recipientId?: mongoose.Types.ObjectId;
  recipientName?: string;
  donationDate: Date;
  donationTime?: string;
  nextEligibleDate: Date;
  bloodGroup: BloodGroup;
  unitsDonated: number;
  hospitalName?: string;
  location?: string;
  notes?: string;
  confirmedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BloodDonationSchema = new Schema<IBloodDonation>(
  {
    donorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bloodRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'BloodRequest',
      index: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    recipientName: {
      type: String,
      trim: true,
      default: '',
    },
    donationDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    donationTime: {
      type: String,
      trim: true,
      default: '',
    },
    nextEligibleDate: {
      type: Date,
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
      index: true,
    },
    unitsDonated: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    hospitalName: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    confirmedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

BloodDonationSchema.index({ donorId: 1, donationDate: -1 });

if (mongoose.models && mongoose.models.BloodDonation) {
  delete (mongoose.models as any).BloodDonation;
}

export const BloodDonation: Model<IBloodDonation> =
  mongoose.models.BloodDonation ||
  mongoose.model<IBloodDonation>('BloodDonation', BloodDonationSchema);
