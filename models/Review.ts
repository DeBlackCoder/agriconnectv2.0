import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  helpfulVotes: mongoose.Types.ObjectId[];
  helpfulCount: number;
  sellerResponse?: {
    text: string;
    respondedAt: Date;
  };
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
      index: true,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (v: string[]) {
          return v.length <= 5;
        },
        message: 'Maximum 5 images allowed',
      },
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
      index: true,
    },
    helpfulVotes: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    sellerResponse: {
      text: String,
      respondedAt: Date,
    },
    isVisible: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });
ReviewSchema.index({ product: 1, rating: -1 });
ReviewSchema.index({ product: 1, createdAt: -1 });
ReviewSchema.index({ user: 1, createdAt: -1 });
ReviewSchema.index({ isVerifiedPurchase: 1, rating: -1 });
ReviewSchema.index({ helpfulCount: -1 });

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
