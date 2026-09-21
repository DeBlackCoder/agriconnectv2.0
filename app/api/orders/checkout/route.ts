import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { requireAuth, isErrorResponse } from '@/lib/middleware';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response';

// POST /api/orders/checkout - Create orders from cart (one per seller)
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();
    
    // Ensure models are registered
    User;
    Product;

    const body = await request.json();
    const { deliveryAddress, phone, notes } = body;

    if (!deliveryAddress || !phone) {
      return errorResponse('Delivery address and phone are required', 400);
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: user.userId })
      .populate({
        path: 'items.product',
        select: 'name price unit stock seller isActive',
      })
      .lean();

    if (!cart || cart.items.length === 0) {
      return errorResponse('Cart is empty', 400);
    }

    // Validate all products and group by seller
    const itemsBySeller: Record<string, any[]> = {};
    const unavailableProducts: string[] = [];

    for (const item of cart.items) {
      const product = item.product as any;

      // Validate product
      if (!product || !product.isActive) {
        unavailableProducts.push(product?.name || 'Unknown product');
        continue;
      }

      if (product.stock < item.quantity) {
        unavailableProducts.push(`${product.name} (only ${product.stock} available)`);
        continue;
      }

      // Group by seller
      const sellerId = product.seller.toString();
      if (!itemsBySeller[sellerId]) {
        itemsBySeller[sellerId] = [];
      }

      itemsBySeller[sellerId].push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit,
      });
    }

    if (unavailableProducts.length > 0) {
      return errorResponse(
        `Some products are unavailable: ${unavailableProducts.join(', ')}`,
        400
      );
    }

    if (Object.keys(itemsBySeller).length === 0) {
      return errorResponse('No valid products in cart', 400);
    }

    // Create one order per seller
    const createdOrders = [];

    for (const [sellerId, items] of Object.entries(itemsBySeller)) {
      // Calculate total for this seller
      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      // Create order
      const order = await Order.create({
        orderNumber,
        buyer: user.userId,
        seller: sellerId,
        items: items.map((item) => ({
          product: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          unit: item.unit,
        })),
        totalAmount,
        status: 'PLACED',
        deliveryAddress: `${deliveryAddress}\nPhone: ${phone}`,
        notes: notes || undefined,
        paymentStatus: 'PENDING',
      });

      // Update product stock
      for (const item of items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }

      // Create notification for seller
      await Notification.create({
        user: sellerId,
        type: 'ORDER_PLACED',
        title: 'New Order Received',
        message: `You have a new order (${orderNumber}) worth ₦${totalAmount.toLocaleString()}`,
        data: { orderId: order._id, orderNumber },
        link: `/dashboard?tab=orders`,
        priority: 'HIGH',
      });

      createdOrders.push(order);
    }

    // Clear cart
    await Cart.findOneAndUpdate(
      { user: user.userId },
      { items: [] }
    );

    return successResponse(
      {
        orders: createdOrders.map((order) => ({
          _id: order._id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
        })),
        message: `${createdOrders.length} order(s) placed successfully`,
      },
      'Orders placed successfully',
      201
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return serverErrorResponse('Failed to process checkout');
  }
}
