import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPriceHistory extends Document {
  _id: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  price: number;
  category: string;
  location: string;
  isOrganic: boolean;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PriceHistorySchema = new Schema<IPriceHistory>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    location: {
      type: String,
      required: true,
      index: true,
    },
    isOrganic: {
      type: Boolean,
      default: false,
      index: true,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient market analysis
PriceHistorySchema.index({ category: 1, recordedAt: -1 });
PriceHistorySchema.index({ category: 1, location: 1, recordedAt: -1 });
PriceHistorySchema.index({ category: 1, isOrganic: 1, recordedAt: -1 });
PriceHistorySchema.index({ product: 1, recordedAt: -1 });
PriceHistorySchema.index({ recordedAt: -1 });

const PriceHistory: Model<IPriceHistory> =
  mongoose.models.PriceHistory || mongoose.model<IPriceHistory>('PriceHistory', PriceHistorySchema);

export default PriceHistory;
