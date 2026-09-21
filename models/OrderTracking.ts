import mongoose, { Schema, Document, Model } from 'mongoose';
import { OrderStatus } from './Order';

export interface IOrderTrackingEntry {
  status: OrderStatus;
  timestamp: Date;
  location?: string;
  notes?: string;
  updatedBy: mongoose.Types.ObjectId;
}

export interface IOrderTracking extends Document {
  _id: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  timeline: IOrderTrackingEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderTrackingEntrySchema = new Schema<IOrderTrackingEntry>(
  {
    status: {
      type: String,
      enum: [
        'PLACED',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'IN_TRANSIT',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'COMPLETED',
        'CANCELLED',
      ],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    location: {
      type: String,
    },
    notes: {
      type: String,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { _id: false }
);

const OrderTrackingSchema = new Schema<IOrderTracking>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true,
      index: true,
    },
    timeline: {
      type: [OrderTrackingEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
OrderTrackingSchema.index({ order: 1 });
OrderTrackingSchema.index({ 'timeline.timestamp': -1 });

const OrderTracking: Model<IOrderTracking> =
  mongoose.models.OrderTracking || mongoose.model<IOrderTracking>('OrderTracking', OrderTrackingSchema);

export default OrderTracking;
