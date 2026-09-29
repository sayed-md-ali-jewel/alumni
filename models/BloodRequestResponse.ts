import mongoose, { Schema, Document, Model } from 'mongoose';

export type BloodResponseStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';

export interface IBloodRequestResponse extends Document {
  bloodRequestId: mongoose.Types.ObjectId;
  donorId: mongoose.Types.ObjectId;
  donorProfileId?: mongoose.Types.ObjectId;
  requesterId: mongoose.Types.ObjectId;
  status: BloodResponseStatus;
  message?: string;
  declineReason?: string;
  respondedAt?: Date;
  completedAt?: Date;
  unitsDonated?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BloodRequestResponseSchema = new Schema<IBloodRequestResponse>(
  {
    bloodRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'BloodRequest',
      required: true,
      index: true,
    },
    donorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    donorProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'AlumniProfile',
      index: true,
    },
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    message: { type: String, default: '' },
    declineReason: { type: String, default: '' },
    respondedAt: { type: Date },
    completedAt: { type: Date },
    unitsDonated: { type: Number, default: 1 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Unique constraint: A single donor can only have one response record per blood request
BloodRequestResponseSchema.index({ bloodRequestId: 1, donorId: 1 }, { unique: true });
BloodRequestResponseSchema.index({ donorId: 1, status: 1, createdAt: -1 });
BloodRequestResponseSchema.index({ requesterId: 1, status: 1, createdAt: -1 });

export const BloodRequestResponse: Model<IBloodRequestResponse> =
  mongoose.models.BloodRequestResponse ||
  mongoose.model<IBloodRequestResponse>('BloodRequestResponse', BloodRequestResponseSchema);
