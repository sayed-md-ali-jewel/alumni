import mongoose, { Schema, Document, Model } from 'mongoose';

export type PaymentMethod =
  | 'bkash'
  | 'nagad'
  | 'cash'
  | 'rocket'
  | 'upay'
  | 'card'
  | 'bank'
  | 'bank_manual';

export type DonationStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface IDonation extends Document {
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  amount: number;
  currency: string;
  campaign: string;
  isAnonymous: boolean;
  method: PaymentMethod;
  transactionId: string;
  valId?: string;
  bankTranId?: string;
  cardType?: string;
  receiptNumber: string;
  status: DonationStatus;
  userId?: mongoose.Types.ObjectId;
  recipientId?: mongoose.Types.ObjectId;
  recipientName?: string;
  givenTo?: string;
  donationDate?: Date;
  donationTime?: string;
  notes?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<IDonation>(
  {
    donorName: { type: String, required: true },
    donorEmail: { type: String, required: true },
    donorPhone: { type: String },
    amount: { type: Number, required: true, min: 10 },
    currency: { type: String, default: 'BDT' },
    campaign: {
      type: String,
      required: true,
      default: 'Student Scholarship Endowment Fund',
    },
    isAnonymous: { type: Boolean, default: false },
    method: {
      type: String,
      enum: ['bkash', 'nagad', 'cash', 'rocket', 'upay', 'card', 'bank', 'bank_manual'],
      default: 'bkash',
    },
    transactionId: { type: String, required: true, unique: true, index: true },
    valId: { type: String },
    bankTranId: { type: String },
    cardType: { type: String },
    receiptNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User' },
    recipientName: { type: String, trim: true },
    givenTo: { type: String, trim: true },
    donationDate: { type: Date, default: Date.now },
    donationTime: { type: String, trim: true },
    notes: { type: String, trim: true },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

if (mongoose.models && mongoose.models.Donation) {
  delete (mongoose.models as any).Donation;
}

export const Donation: Model<IDonation> =
  mongoose.models.Donation || mongoose.model<IDonation>('Donation', DonationSchema);
