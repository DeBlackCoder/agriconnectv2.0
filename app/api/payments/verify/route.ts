import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import OrderTracking from '@/models/OrderTracking';
import Notification from '@/models/Notification';
import { requireAuth, isErrorResponse } from '@/lib/middleware';
import { verifyPaystackTransaction, koboToNaira } from '@/lib/paystack';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response';

// POST /api/payments/verify - Verify payment status
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return errorResponse('Payment reference is required', 400);
    }

    // Find payment record
    const payment = await Payment.findOne({ reference });
    if (!payment) {
      return notFoundResponse('Payment not found');
    }

    // Verify payment belongs to user
    if (payment.user.toString() !== user.userId) {
      return errorResponse('Unauthorized to verify this payment', 403);
    }

    // If already verified as successful, return existing data
    if (payment.status === 'SUCCESS') {
      return successResponse({
        payment: {
          id: payment._id,
          reference: payment.reference,
          amount: payment.amount,
          status: payment.status,
          paidAt: payment.paidAt,
        },
        order: await Order.findById(payment.order).lean(),
        message: 'Payment already verified',
      });
    }

    // Verify with Paystack
    const paystackResponse = await verifyPaystackTransaction(reference);

    if (!paystackResponse.status) {
      return errorResponse('Payment verification failed', 400);
    }

    const { data } = paystackResponse;

    // Verify amount matches
    const paidAmount = koboToNaira(data.amount);
    if (Math.abs(paidAmount - payment.amount) > 0.01) {
      return errorResponse('Payment amount mismatch', 400);
    }

    // Update payment status
    payment.status = data.status === 'success' ? 'SUCCESS' : 'FAILED';
    payment.paymentMethod = data.channel;
    payment.channel = data.channel;
    payment.gatewayResponse = data;
    payment.paidAt = data.status === 'success' ? new Date(data.paid_at) : undefined;
    await payment.save();

    // Update order if payment successful
    if (data.status === 'success') {
      const order = await Order.findById(payment.order);
      if (order) {
        order.paymentStatus = 'PAID';
        order.paymentReference = reference;
        
        // Update order status to CONFIRMED if still PLACED
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
                notes: 'Payment confirmed',
                updatedBy: user.userId,
              },
            },
          },
          { upsert: true }
        );

        // Create notifications for buyer and seller
        await Notification.create([
          {
            user: order.buyer,
            type: 'PAYMENT_SUCCESS',
            title: 'Payment Successful',
            message: `Your payment of ₦${payment.amount.toLocaleString()} for order ${order.orderNumber} has been confirmed.`,
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
    } else {
      // Payment failed - update order
      await Order.findByIdAndUpdate(payment.order, {
        paymentStatus: 'FAILED',
      });

      // Create notification
      const order = await Order.findById(payment.order);
      if (order) {
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

    return successResponse({
      payment: {
        id: payment._id,
        reference: payment.reference,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        paidAt: payment.paidAt,
      },
      order: await Order.findById(payment.order).lean(),
      verified: data.status === 'success',
    }, data.status === 'success' ? 'Payment verified successfully' : 'Payment verification failed');
  } catch (error) {
    console.error('Verify payment error:', error);
    
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }
    
    return serverErrorResponse('Failed to verify payment');
  }
}
