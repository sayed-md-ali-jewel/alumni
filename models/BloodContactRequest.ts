import mongoose, { Schema, Document, Model } from 'mongoose';
import { BloodGroup, BloodRequestUrgency, BLOOD_GROUPS, BLOOD_REQUEST_URGENCIES } from '@/lib/types';

export interface IBloodContactRequest extends Document {
  donorUserId: mongoose.Types.ObjectId;
  requesterId: mongoose.Types.ObjectId;
  bloodRequestId?: mongoose.Types.ObjectId;
  reason: string;
  patientName: string;
  bloodGroup: BloodGroup;
  hospitalName: string;
  hospitalLocation: string;
  urgency: BloodRequestUrgency;
  message: string;
  contactPhone: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  createdAt: Date;
  updatedAt: Date;
}

const BloodContactRequestSchema = new Schema<IBloodContactRequest>(
  {
    donorUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    requesterId: {
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
    reason: { type: String, required: true },
    patientName: { type: String, required: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    hospitalName: { type: String, required: true },
    hospitalLocation: { type: String, required: true },
    urgency: {
      type: String,
      enum: BLOOD_REQUEST_URGENCIES,
      default: BloodRequestUrgency.NORMAL,
    },
    message: { type: String, required: true },
    contactPhone: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Declined'],
      default: 'Pending',
      index: true,
    },
  },
  { timestamps: true }
);

export const BloodContactRequest: Model<IBloodContactRequest> =
  mongoose.models.BloodContactRequest ||
  mongoose.model<IBloodContactRequest>('BloodContactRequest', BloodContactRequestSchema);
