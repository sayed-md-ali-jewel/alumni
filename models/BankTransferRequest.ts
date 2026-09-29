import mongoose, { Schema, Document, Model } from 'mongoose';

export type BankTransferStatus = 'pending_review' | 'approved' | 'rejected';

export interface IBankTransferRequest extends Document {
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  amount: number;
  campaign: string;
  bankName: string;
  branch?: string;
  transactionRef: string;
  screenshotUrl?: string;
  notes?: string;
  status: BankTransferStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  donationId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BankTransferRequestSchema = new Schema<IBankTransferRequest>(
  {
    donorName: { type: String, required: true },
    donorEmail: { type: String, required: true },
    donorPhone: { type: String, required: true },
    amount: { type: Number, required: true, min: 10 },
    campaign: { type: String, required: true },
    bankName: { type: String, required: true, default: 'Dutch-Bangla Bank PLC' },
    branch: { type: String, default: '' },
    transactionRef: { type: String, required: true, unique: true, index: true },
    screenshotUrl: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending_review', 'approved', 'rejected'],
      default: 'pending_review',
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    donationId: { type: Schema.Types.ObjectId, ref: 'Donation' },
  },
  { timestamps: true }
);

export const BankTransferRequest: Model<IBankTransferRequest> =
  mongoose.models.BankTransferRequest ||
  mongoose.model<IBankTransferRequest>('BankTransferRequest', BankTransferRequestSchema);
