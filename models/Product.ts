import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: 'kg' | 'g' | 'liters' | 'ml' | 'pieces' | 'bunches' | 'bags';
  stock: number;
  minOrder: number;
  location: string;
  isOrganic: boolean;
  harvestDate?: Date;
  images: string[];
  averageRating: number;
  reviewCount: number;
  views: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: 'text',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      index: 'text',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
      index: true,
    },
    unit: {
      type: String,
      enum: ['kg', 'g', 'liters', 'ml', 'pieces', 'bunches', 'bags'],
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      index: true,
    },
    minOrder: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      index: true,
    },
    isOrganic: {
      type: Boolean,
      default: false,
      index: true,
    },
    harvestDate: {
      type: Date,
    },
    images: {
      type: [String],
      validate: {
        validator: function (v: string[]) {
          return v.length <= 5;
        },
        message: 'Maximum 5 images allowed',
      },
      default: [],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient querying
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ category: 1, isOrganic: 1 });
ProductSchema.index({ location: 1, category: 1 });
ProductSchema.index({ seller: 1, isActive: 1 });
ProductSchema.index({ averageRating: -1, reviewCount: -1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ stock: 1, isActive: 1 });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
