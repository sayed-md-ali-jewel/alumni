import mongoose, { Schema, Document, Model } from 'mongoose';

export type RsvpStatus = 'going' | 'interested' | 'declined';

export interface IRsvp extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  status: RsvpStatus;
  guestsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const RsvpSchema = new Schema<IRsvp>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    status: {
      type: String,
      enum: ['going', 'interested', 'declined'],
      default: 'going',
    },
    guestsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Prevent duplicate RSVP records per user and event
RsvpSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export const Rsvp: Model<IRsvp> =
  mongoose.models.Rsvp || mongoose.model<IRsvp>('Rsvp', RsvpSchema);
