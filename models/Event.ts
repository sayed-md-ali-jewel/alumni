import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
  title_bn: string;
  title_en: string;
  description_bn: string;
  description_en: string;
  date: Date;
  location: string;
  category: 'Reunion' | 'Webinar' | 'Gala' | 'Workshop' | 'Sports' | 'Networking';
  image?: string;
  capacity?: number;
  allowSharing?: boolean;
  createdBy: mongoose.Types.ObjectId;
  attendees: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title_bn: { type: String, required: true },
    title_en: { type: String, required: true },
    description_bn: { type: String, required: true },
    description_en: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    location: { type: String, required: true },
    category: {
      type: String,
      enum: ['Reunion', 'Webinar', 'Gala', 'Workshop', 'Sports', 'Networking'],
      default: 'Reunion',
    },
    image: { type: String },
    capacity: { type: Number, default: 500 },
    allowSharing: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
