import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVerificationCode extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  code: string;
  type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
  expiresAt: Date;
  attempts: number;
  used: boolean;
  createdAt: Date;
}

const VerificationCodeSchema = new Schema<IVerificationCode>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['EMAIL_VERIFICATION', 'PASSWORD_RESET'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete expired codes after 30 minutes
VerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for efficient lookup
VerificationCodeSchema.index({ email: 1, type: 1, used: 1 });

const VerificationCode: Model<IVerificationCode> =
  mongoose.models.VerificationCode ||
  mongoose.model<IVerificationCode>('VerificationCode', VerificationCodeSchema);

export default VerificationCode;
