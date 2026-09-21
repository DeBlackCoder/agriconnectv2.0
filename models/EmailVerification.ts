import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmailVerification extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

const EmailVerificationSchema = new Schema<IEmailVerification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete expired tokens after 24 hours
EmailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailVerification: Model<IEmailVerification> =
  mongoose.models.EmailVerification ||
  mongoose.model<IEmailVerification>('EmailVerification', EmailVerificationSchema);

export default EmailVerification;
