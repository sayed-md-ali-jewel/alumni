import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISmtpSetting extends Document {
  key: string;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  isEnabled: boolean;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_SMTP_SETTINGS = {
  key: 'smtp_settings',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  user: '',
  pass: '',
  fromName: 'KHS Alumni Association',
  fromEmail: 'noreply@khsalumni.org',
  replyTo: 'info@khsalumni.org',
  isEnabled: true,
};

const SmtpSettingSchema = new Schema<ISmtpSetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'smtp_settings',
      index: true,
    },
    host: { type: String, default: DEFAULT_SMTP_SETTINGS.host, trim: true },
    port: { type: Number, default: DEFAULT_SMTP_SETTINGS.port },
    secure: { type: Boolean, default: DEFAULT_SMTP_SETTINGS.secure },
    user: { type: String, default: '', trim: true },
    pass: { type: String, default: '' },
    fromName: { type: String, default: DEFAULT_SMTP_SETTINGS.fromName, trim: true },
    fromEmail: { type: String, default: DEFAULT_SMTP_SETTINGS.fromEmail, trim: true },
    replyTo: { type: String, default: DEFAULT_SMTP_SETTINGS.replyTo, trim: true },
    isEnabled: { type: Boolean, default: true },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const SmtpSetting: Model<ISmtpSetting> =
  (mongoose.models && mongoose.models.SmtpSetting) ||
  mongoose.model<ISmtpSetting>('SmtpSetting', SmtpSettingSchema);
