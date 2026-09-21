import { NextRequest } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import OrderTracking from '@/models/OrderTracking';
import Notification from '@/models/Notification';
import { koboToNaira } from '@/lib/paystack';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response';

// POST /api/payments/webhook - Paystack webhook handler
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature validation
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      return errorResponse('No signature provided', 401);
    }

    // Validate webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return errorResponse('Invalid signature', 401);
    }

    // Parse event data
    const event = JSON.parse(body);

    await connectDB();

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data);
        break;

      case 'charge.failed':
        await handleChargeFailed(event.data);
        break;

      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return successResponse({ received: true }, 'Webhook processed');
  } catch (error) {
    console.error('Webhook processing error:', error);
    return serverErrorResponse('Webhook processing failed');
  }
}

async function handleChargeSuccess(data: any) {
  const reference = data.reference;
  const amount = koboToNaira(data.amount);

  // Find payment
  const payment = await Payment.findOne({ reference });
  if (!payment) {
    console.error('Payment not found for reference:', reference);
    return;
  }

  // Skip if already processed
  if (payment.status === 'SUCCESS') {
    return;
  }

  // Update payment
  payment.status = 'SUCCESS';
  payment.paymentMethod = data.channel;
  payment.channel = data.channel;
  payment.gatewayResponse = data;
  payment.paidAt = new Date(data.paid_at);
  await payment.save();

  // Update order
  const order = await Order.findById(payment.order);
  if (order) {
    order.paymentStatus = 'PAID';
    order.paymentReference = reference;
    
    if (order.status === 'PLACED') {
      order.status = 'CONFIRMED';
      order.confirmedAt = new Date();
    }
    
    await order.save();

    // Update order tracking
    await OrderTracking.findOneAndUpdate(
      { order: order._id },
      {
        $push: {
          timeline: {
            status: 'CONFIRMED',
            timestamp: new Date(),
            notes: 'Payment confirmed via webhook',
            updatedBy: order.buyer,
          },
        },
      },
      { upsert: true }
    );

    // Create notifications
    await Notification.create([
      {
        user: order.buyer,
        type: 'PAYMENT_SUCCESS',
        title: 'Payment Successful',
        message: `Your payment of ₦${amount.toLocaleString()} for order ${order.orderNumber} has been confirmed.`,
        data: { orderId: order._id, paymentId: payment._id },
        link: `/orders/${order._id}`,
        priority: 'HIGH',
      },
      {
        user: order.seller,
        type: 'ORDER_CONFIRMED',
        title: 'New Order Confirmed',
        message: `Order ${order.orderNumber} has been paid and confirmed. Please prepare for shipment.`,
        data: { orderId: order._id, paymentId: payment._id },
        link: `/orders/${order._id}`,
        priority: 'HIGH',
      },
    ]);
  }
}

async function handleChargeFailed(data: any) {
  const reference = data.reference;

  // Find payment
  const payment = await Payment.findOne({ reference });
  if (!payment) {
    console.error('Payment not found for reference:', reference);
    return;
  }

  // Update payment
  payment.status = 'FAILED';
  payment.gatewayResponse = data;
  await payment.save();

  // Update order
  const order = await Order.findByIdAndUpdate(payment.order, {
    paymentStatus: 'FAILED',
  });

  if (order) {
    // Create notification
    await Notification.create({
      user: order.buyer,
      type: 'PAYMENT_FAILED',
      title: 'Payment Failed',
      message: `Your payment for order ${order.orderNumber} has failed. Please try again.`,
      data: { orderId: order._id, paymentId: payment._id },
      link: `/orders/${order._id}`,
      priority: 'HIGH',
    });
  }
}
