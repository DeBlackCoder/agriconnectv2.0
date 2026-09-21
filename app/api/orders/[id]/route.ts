import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import OrderTracking from '@/models/OrderTracking';
import Product from '@/models/Product';
import User from '@/models/User'; // Import User model to register schema
import Notification from '@/models/Notification';
import { requireAuth, isErrorResponse } from '@/lib/middleware';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  notFoundResponse,
  forbiddenResponse,
} from '@/lib/api-response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/orders/[id] - Get order details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();
    
    // Ensure User model is registered before populate
    User; // Force registration

    const { id } = await params;

    const order = await Order.findById(id)
      .populate('buyer', 'name email phone avatar')
      .populate('seller', 'name email phone avatar')
      .lean();

    if (!order) {
      return notFoundResponse('Order not found');
    }

    // Verify user has access to this order
    const isBuyer = order.buyer._id.toString() === user.userId;
    const isSeller = order.seller._id.toString() === user.userId;
    const isAdmin = user.role === 'ADMIN';

    if (!isBuyer && !isSeller && !isAdmin) {
      return forbiddenResponse('You do not have access to this order');
    }

    // Get tracking information
    const tracking = await OrderTracking.findOne({ order: id })
      .populate('timeline.updatedBy', 'name')
      .lean();

    return successResponse({
      order,
      tracking: tracking?.timeline || [],
    });
  } catch (error) {
    console.error('Get order error:', error);
    return serverErrorResponse('Failed to fetch order');
  }
}

// PATCH /api/orders/[id] - Cancel order
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { action, reason } = body;

    const order = await Order.findById(id);
    if (!order) {
      return notFoundResponse('Order not found');
    }

    // Verify user is the buyer
    if (order.buyer.toString() !== user.userId) {
      return forbiddenResponse('Only the buyer can cancel the order');
    }

    if (action === 'cancel') {
      // Can only cancel before SHIPPED
      if (['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'].includes(order.status)) {
        return errorResponse('Cannot cancel order after it has been shipped', 400);
      }

      if (order.status === 'CANCELLED') {
        return errorResponse('Order is already cancelled', 400);
      }

      // Restore product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }

      // Update order
      order.status = 'CANCELLED';
      order.cancelledAt = new Date();
      order.cancellationReason = reason || 'Cancelled by buyer';
      await order.save();

      // Update tracking
      await OrderTracking.findOneAndUpdate(
        { order: id },
        {
          $push: {
            timeline: {
              status: 'CANCELLED',
              timestamp: new Date(),
              notes: reason || 'Cancelled by buyer',
              updatedBy: user.userId,
            },
          },
        }
      );

      // Create notifications
      await Notification.create([
        {
          user: order.buyer,
          type: 'ORDER_CANCELLED',
          title: 'Order Cancelled',
          message: `Your order ${order.orderNumber} has been cancelled.`,
          data: { orderId: order._id },
          link: `/orders/${order._id}`,
          priority: 'MEDIUM',
        },
        {
          user: order.seller,
          type: 'ORDER_CANCELLED',
          title: 'Order Cancelled',
          message: `Order ${order.orderNumber} has been cancelled by the buyer.`,
          data: { orderId: order._id },
          link: `/orders/${order._id}`,
          priority: 'MEDIUM',
        },
      ]);

      return successResponse(order, 'Order cancelled successfully');
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    console.error('Update order error:', error);
    return serverErrorResponse('Failed to update order');
  }
}
