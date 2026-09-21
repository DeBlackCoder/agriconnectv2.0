import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import OrderTracking from '@/models/OrderTracking';
import { requireAuth, isErrorResponse } from '@/lib/middleware';
import { calculateOrderProgress } from '@/lib/order-utils';
import {
  successResponse,
  serverErrorResponse,
  notFoundResponse,
  forbiddenResponse,
} from '@/lib/api-response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/orders/[id]/tracking - Get order tracking information
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    const { id } = await params;

    const order = await Order.findById(id)
      .select('orderNumber status buyer seller shippingInfo createdAt')
      .lean();

    if (!order) {
      return notFoundResponse('Order not found');
    }

    // Verify user has access to this order
    const isBuyer = order.buyer.toString() === user.userId;
    const isSeller = order.seller.toString() === user.userId;
    const isAdmin = user.role === 'ADMIN';

    if (!isBuyer && !isSeller && !isAdmin) {
      return forbiddenResponse('You do not have access to this order tracking');
    }

    // Get tracking timeline
    const tracking = await OrderTracking.findOne({ order: id })
      .populate('timeline.updatedBy', 'name')
      .lean();

    // Calculate progress
    const progress = calculateOrderProgress(order.status);

    // Build tracking steps for visual display
    const trackingSteps = [
      {
        status: 'PLACED',
        label: 'Order Placed',
        completed: true,
        timestamp: order.createdAt,
      },
      {
        status: 'CONFIRMED',
        label: 'Confirmed',
        completed: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'].includes(order.status),
        timestamp: tracking?.timeline.find(t => t.status === 'CONFIRMED')?.timestamp,
      },
      {
        status: 'PROCESSING',
        label: 'Processing',
        completed: ['PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'].includes(order.status),
        timestamp: tracking?.timeline.find(t => t.status === 'PROCESSING')?.timestamp,
      },
      {
        status: 'SHIPPED',
        label: 'Shipped',
        completed: ['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'].includes(order.status),
        timestamp: tracking?.timeline.find(t => t.status === 'SHIPPED')?.timestamp,
      },
      {
        status: 'IN_TRANSIT',
        label: 'In Transit',
        completed: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'].includes(order.status),
        timestamp: tracking?.timeline.find(t => t.status === 'IN_TRANSIT')?.timestamp,
      },
      {
        status: 'OUT_FOR_DELIVERY',
        label: 'Out for Delivery',
        completed: ['OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'].includes(order.status),
        timestamp: tracking?.timeline.find(t => t.status === 'OUT_FOR_DELIVERY')?.timestamp,
      },
      {
        status: 'DELIVERED',
        label: 'Delivered',
        completed: ['DELIVERED', 'COMPLETED'].includes(order.status),
        timestamp: tracking?.timeline.find(t => t.status === 'DELIVERED')?.timestamp,
      },
    ];

    return successResponse({
      orderNumber: order.orderNumber,
      currentStatus: order.status,
      progress,
      shippingInfo: order.shippingInfo,
      trackingSteps,
      timeline: tracking?.timeline || [],
    });
  } catch (error) {
    console.error('Get tracking error:', error);
    return serverErrorResponse('Failed to fetch tracking information');
  }
}
