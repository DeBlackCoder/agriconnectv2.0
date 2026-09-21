import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import OrderTracking from '@/models/OrderTracking';
import Product from '@/models/Product';
import User from '@/models/User'; // Import User model to register schema
import Notification from '@/models/Notification';
import { requireAuth, isErrorResponse } from '@/lib/middleware';
import { createOrderSchema } from '@/lib/validations';
import { generateOrderNumber } from '@/lib/order-utils';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  handleZodError,
  serverErrorResponse,
} from '@/lib/api-response';

// GET /api/orders - List user's orders
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();
    
    // Ensure User model is registered before populate
    User; // Force registration

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'buyer'; // 'buyer' or 'seller'
    const status = searchParams.get('status');
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;

    // Build query based on role parameter (not user.role)
    const query: Record<string, unknown> = {};
    
    if (role === 'buyer') {
      query.buyer = user.userId;
    } else if (role === 'seller') {
      query.seller = user.userId;
    }

    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [orders, totalCount] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('buyer', 'name email phone avatar')
        .populate('seller', 'name email phone avatar')
        .lean(),
      Order.countDocuments(query),
    ]);

    // Calculate stats
    const stats = {
      total: await Order.countDocuments(
        role === 'buyer' ? { buyer: user.userId } : { seller: user.userId }
      ),
      placed: await Order.countDocuments({
        ...(role === 'buyer' ? { buyer: user.userId } : { seller: user.userId }),
        status: 'PLACED',
      }),
      confirmed: await Order.countDocuments({
        ...(role === 'buyer' ? { buyer: user.userId } : { seller: user.userId }),
        status: 'CONFIRMED',
      }),
      inProgress: await Order.countDocuments({
        ...(role === 'buyer' ? { buyer: user.userId } : { seller: user.userId }),
        status: { $in: ['PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'] },
      }),
      delivered: await Order.countDocuments({
        ...(role === 'buyer' ? { buyer: user.userId } : { seller: user.userId }),
        status: 'DELIVERED',
      }),
      completed: await Order.countDocuments({
        ...(role === 'buyer' ? { buyer: user.userId } : { seller: user.userId }),
        status: 'COMPLETED',
      }),
      cancelled: await Order.countDocuments({
        ...(role === 'buyer' ? { buyer: user.userId } : { seller: user.userId }),
        status: 'CANCELLED',
      }),
    };

    const totalPages = Math.ceil(totalCount / limit);

    return successResponse({
      orders,
      stats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return serverErrorResponse('Failed to fetch orders');
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();
    
    // Ensure User model is registered before populate
    User; // Force registration

    const body = await request.json();

    // Validate input
    const validation = createOrderSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(handleZodError(validation.error));
    }

    const { items, deliveryAddress, notes } = validation.data;

    // Verify all products exist, are active, and belong to same seller
    const productIds = items.map(item => item.product);
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    });

    if (products.length !== items.length) {
      return errorResponse('One or more products not found or inactive', 400);
    }

    // Check all products have same seller
    const sellers = [...new Set(products.map(p => p.seller.toString()))];
    if (sellers.length > 1) {
      return errorResponse('Cannot order products from multiple sellers in one order', 400);
    }

    const sellerId = sellers[0];

    // Validate stock and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find(p => p._id.toString() === item.product);
      if (!product) {
        return errorResponse(`Product ${item.product} not found`, 400);
      }

      // Check stock
      if (product.stock < item.quantity) {
        return errorResponse(
          `Insufficient stock for ${product.name}. Available: ${product.stock}`,
          400
        );
      }

      // Check minimum order quantity
      if (item.quantity < product.minOrder) {
        return errorResponse(
          `Minimum order quantity for ${product.name} is ${product.minOrder}`,
          400
        );
      }

      totalAmount += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        unit: product.unit,
      });
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order
    const order = await Order.create({
      orderNumber,
      buyer: user.userId,
      seller: sellerId,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      notes,
      status: 'PLACED',
      paymentStatus: 'PENDING',
    });

    // Create order tracking
    await OrderTracking.create({
      order: order._id,
      timeline: [
        {
          status: 'PLACED',
          timestamp: new Date(),
          notes: 'Order placed successfully',
          updatedBy: user.userId,
        },
      ],
    });

    // Create notifications
    await Notification.create([
      {
        user: user.userId,
        type: 'ORDER_PLACED',
        title: 'Order Placed Successfully',
        message: `Your order ${orderNumber} has been placed. Total: ₦${totalAmount.toLocaleString()}`,
        data: { orderId: order._id },
        link: `/orders/${order._id}`,
        priority: 'HIGH',
      },
      {
        user: sellerId,
        type: 'ORDER_PLACED',
        title: 'New Order Received',
        message: `You have a new order ${orderNumber}. Total: ₦${totalAmount.toLocaleString()}`,
        data: { orderId: order._id },
        link: `/orders/${order._id}`,
        priority: 'HIGH',
      },
    ]);

    // Populate order data
    await order.populate([
      { path: 'buyer', select: 'name email phone' },
      { path: 'seller', select: 'name email phone' },
    ]);

    return successResponse(order, 'Order created successfully', 201);
  } catch (error) {
    console.error('Create order error:', error);
    return serverErrorResponse('Failed to create order');
  }
}
