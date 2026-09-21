import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBuyerProfile extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  businessName?: string;
  deliveryAddress?: string;
  phone?: string;
  preferences: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BuyerProfileSchema = new Schema<IBuyerProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    businessName: {
      type: String,
      trim: true,
    },
    deliveryAddress: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    preferences: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
BuyerProfileSchema.index({ user: 1 });

const BuyerProfile: Model<IBuyerProfile> =
  mongoose.models.BuyerProfile || mongoose.model<IBuyerProfile>('BuyerProfile', BuyerProfileSchema);

export default BuyerProfile;
