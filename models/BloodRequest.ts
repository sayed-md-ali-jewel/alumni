import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  BloodGroup,
  BloodRequestUrgency,
  BloodRequestStatus,
  BLOOD_GROUPS,
  BLOOD_REQUEST_URGENCIES,
  BLOOD_REQUEST_STATUSES,
} from '@/lib/types';

export interface IContactedDonor {
  _id?: string;
  donorId?: mongoose.Types.ObjectId;
  donorUserId?: mongoose.Types.ObjectId;
  donorName: string;
  donorPhone?: string;
  donorBloodGroup?: string;
  donorImage?: string;
  donorLocation?: string;
  contactedAt: Date;
  status: 'Sent' | 'Pending' | 'Accepted' | 'Declined';
  message?: string;
  contactedBy?: mongoose.Types.ObjectId;
}

export interface IBloodRequest extends Document {
  requesterId: mongoose.Types.ObjectId;
  patientName: string;
  bloodGroup: BloodGroup;
  requiredUnits: number;
  fulfilledUnits: number;
  hospitalName: string;
  hospitalAddress?: string;
  hospitalLocation: string;
  requiredDate: Date;
  urgency: BloodRequestUrgency;
  contactName: string;
  contactPhone: string;
  additionalInformation?: string;
  status: BloodRequestStatus;
  acceptedByDonorId?: mongoose.Types.ObjectId;
  acceptedByUserId?: mongoose.Types.ObjectId;
  acceptedByName?: string;
  acceptedByPhone?: string;
  acceptedByImage?: string;
  acceptedAt?: Date;
  contactedDonors?: IContactedDonor[];
  createdAt: Date;
  updatedAt: Date;
}

const BloodRequestSchema = new Schema<IBloodRequest>(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
      index: true,
    },
    requiredUnits: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    fulfilledUnits: {
      type: Number,
      default: 0,
      min: 0,
    },
    hospitalName: {
      type: String,
      required: true,
      trim: true,
    },
    hospitalAddress: {
      type: String,
      trim: true,
      default: '',
    },
    hospitalLocation: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    requiredDate: {
      type: Date,
      required: true,
      index: true,
    },
    urgency: {
      type: String,
      enum: BLOOD_REQUEST_URGENCIES,
      default: BloodRequestUrgency.NORMAL,
      index: true,
    },
    contactName: {
      type: String,
      required: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },
    additionalInformation: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: BLOOD_REQUEST_STATUSES,
      default: BloodRequestStatus.OPEN,
      index: true,
    },
    acceptedByDonorId: {
      type: Schema.Types.ObjectId,
      ref: 'AlumniProfile',
    },
    acceptedByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    acceptedByName: {
      type: String,
      trim: true,
    },
    acceptedByPhone: {
      type: String,
      trim: true,
    },
    acceptedByImage: {
      type: String,
      trim: true,
    },
    acceptedAt: {
      type: Date,
    },
    contactedDonors: [
      {
        donorId: { type: Schema.Types.ObjectId, ref: 'AlumniProfile' },
        donorUserId: { type: Schema.Types.ObjectId, ref: 'User' },
        donorName: { type: String, required: true },
        donorPhone: { type: String },
        donorBloodGroup: { type: String },
        donorImage: { type: String },
        donorLocation: { type: String },
        contactedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ['Sent', 'Pending', 'Accepted', 'Declined'],
          default: 'Sent',
        },
        message: { type: String },
        contactedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  { timestamps: true }
);

// Compound indexes for active queries
BloodRequestSchema.index({ status: 1, urgency: 1, requiredDate: 1 });
BloodRequestSchema.index({ bloodGroup: 1, status: 1, hospitalLocation: 1 });

// Text index for search
BloodRequestSchema.index({
  patientName: 'text',
  hospitalName: 'text',
  hospitalLocation: 'text',
  additionalInformation: 'text',
});

export const BloodRequest: Model<IBloodRequest> =
  mongoose.models.BloodRequest ||
  mongoose.model<IBloodRequest>('BloodRequest', BloodRequestSchema);
