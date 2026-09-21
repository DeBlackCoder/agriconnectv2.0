import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFarmerProfile extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  farmName: string;
  farmLocation: string;
  farmSize?: number;
  experience?: number;
  certifications: string[];
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FarmerProfileSchema = new Schema<IFarmerProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    farmName: {
      type: String,
      required: [true, 'Farm name is required'],
      trim: true,
    },
    farmLocation: {
      type: String,
      required: [true, 'Farm location is required'],
      trim: true,
    },
    farmSize: {
      type: Number,
      min: 0,
    },
    experience: {
      type: Number,
      min: 0,
      default: 0,
    },
    certifications: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
FarmerProfileSchema.index({ user: 1 });
FarmerProfileSchema.index({ farmLocation: 1 });

const FarmerProfile: Model<IFarmerProfile> =
  mongoose.models.FarmerProfile || mongoose.model<IFarmerProfile>('FarmerProfile', FarmerProfileSchema);

export default FarmerProfile;
