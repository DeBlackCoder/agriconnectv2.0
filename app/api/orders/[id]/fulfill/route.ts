import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import OrderTracking from '@/models/OrderTracking';
import Product from '@/models/Product';
import Notification from '@/models/Notification';
import { requireRole, isErrorResponse } from '@/lib/middleware';
import { updateOrderStatusSchema } from '@/lib/validations';
import { isValidStatusTransition } from '@/lib/order-utils';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  handleZodError,
  serverErrorResponse,
  notFoundResponse,
  forbiddenResponse,
} from '@/lib/api-response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/orders/[id]/fulfill - Update order status and fulfill (Sellers only)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireRole(request, ['USER', 'ADMIN']);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateOrderStatusSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(handleZodError(validation.error));
    }

    const { status, trackingNumber, carrier, estimatedDelivery, notes } = validation.data;

    const order = await Order.findById(id);
    if (!order) {
      return notFoundResponse('Order not found');
    }

    // Verify user is the seller or admin
    if (user.role !== 'ADMIN' && order.seller.toString() !== user.userId) {
      return forbiddenResponse('You can only fulfill your own orders');
    }

    // Validate status transition
    if (!isValidStatusTransition(order.status, status)) {
      return errorResponse(
        `Invalid status transition from ${order.status} to ${status}`,
        400
      );
    }

    // Check payment status for certain transitions
    if (status === 'PROCESSING' && order.paymentStatus !== 'PAID') {
      return errorResponse('Order must be paid before processing', 400);
    }

    // Deduct stock when confirming order
    if (status === 'CONFIRMED' && order.status === 'PLACED') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return errorResponse(`Product ${item.productName} not found`, 400);
        }

        if (product.stock < item.quantity) {
          return errorResponse(
            `Insufficient stock for ${item.productName}. Available: ${product.stock}`,
            400
          );
        }

        // Deduct stock
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    // Update order status
    order.status = status;

    // Update status-specific fields
    if (status === 'CONFIRMED') {
      order.confirmedAt = new Date();
    } else if (status === 'SHIPPED') {
      order.shippedAt = new Date();
      if (trackingNumber || carrier || estimatedDelivery) {
        order.shippingInfo = {
          trackingNumber,
          carrier,
          estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
          notes,
        };
      }
    } else if (status === 'DELIVERED') {
      order.deliveredAt = new Date();
    } else if (status === 'COMPLETED') {
      order.completedAt = new Date();
    }

    await order.save();

    // Update order tracking
    await OrderTracking.findOneAndUpdate(
      { order: id },
      {
        $push: {
          timeline: {
            status,
            timestamp: new Date(),
            notes: notes || `Order status updated to ${status}`,
            updatedBy: user.userId,
          },
        },
      },
      { upsert: true }
    );

    // Create notification for buyer
    const notificationTitles: Record<string, string> = {
      CONFIRMED: 'Order Confirmed',
      PROCESSING: 'Order Processing',
      SHIPPED: 'Order Shipped',
      IN_TRANSIT: 'Order In Transit',
      OUT_FOR_DELIVERY: 'Out for Delivery',
      DELIVERED: 'Order Delivered',
      COMPLETED: 'Order Completed',
    };

    const notificationMessages: Record<string, string> = {
      CONFIRMED: 'Your order has been confirmed and will be processed soon.',
      PROCESSING: 'Your order is being prepared for shipment.',
      SHIPPED: `Your order has been shipped${trackingNumber ? ` with tracking number: ${trackingNumber}` : ''}.`,
      IN_TRANSIT: 'Your order is on its way to you.',
      OUT_FOR_DELIVERY: 'Your order is out for delivery and will arrive soon.',
      DELIVERED: 'Your order has been delivered. Please confirm receipt.',
      COMPLETED: 'Your order has been completed. Thank you for your purchase!',
    };

    await Notification.create({
      user: order.buyer,
      type: status === 'SHIPPED' ? 'ORDER_SHIPPED' : status === 'DELIVERED' ? 'ORDER_DELIVERED' : 'ORDER_CONFIRMED',
      title: notificationTitles[status] || 'Order Updated',
      message: `${notificationMessages[status] || 'Your order status has been updated.'} Order: ${order.orderNumber}`,
      data: { orderId: order._id },
      link: `/orders/${order._id}`,
      priority: ['SHIPPED', 'DELIVERED'].includes(status) ? 'HIGH' : 'MEDIUM',
    });

    // Populate order data
    await order.populate([
      { path: 'buyer', select: 'name email phone' },
      { path: 'seller', select: 'name email phone' },
    ]);

    return successResponse(order, `Order status updated to ${status}`);
  } catch (error) {
    console.error('Fulfill order error:', error);
    return serverErrorResponse('Failed to fulfill order');
  }
}
