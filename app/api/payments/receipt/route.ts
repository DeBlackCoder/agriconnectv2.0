import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Order from '@/models/Order';
import User from '@/models/User';
import { requireAuth, isErrorResponse } from '@/lib/middleware';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response';

// GET /api/payments/receipt - Get payment receipt
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    const paymentId = searchParams.get('paymentId');

    if (!reference && !paymentId) {
      return errorResponse('Either reference or paymentId is required', 400);
    }

    // Find payment
    const query: Record<string, unknown> = {};
    if (reference) {
      query.reference = reference;
    } else if (paymentId) {
      query._id = paymentId;
    }

    const payment = await Payment.findOne(query)
      .populate('user', 'name email phone')
      .populate('order')
      .lean();

    if (!payment) {
      return notFoundResponse('Payment not found');
    }

    // Verify payment belongs to user
    if (payment.user._id.toString() !== user.userId) {
      return errorResponse('Unauthorized to view this receipt', 403);
    }

    // Only show receipt for successful payments
    if (payment.status !== 'SUCCESS') {
      return errorResponse('Receipt only available for successful payments', 400);
    }

    // Get order details with populated user info
    const order = payment.order as any;
    const paymentUser = payment.user as any;
    const seller = await User.findById(order.seller).select('name email phone').lean();

    // Generate receipt data
    const receipt = {
      receiptNumber: `RCP-${payment.reference}`,
      paymentReference: payment.reference,
      transactionDate: payment.paidAt,
      paymentStatus: payment.status,
      
      // Payer information
      payer: {
        name: paymentUser?.name || 'N/A',
        email: paymentUser?.email || 'N/A',
        phone: paymentUser?.phone || 'N/A',
      },

      // Seller information
      seller: {
        name: seller?.name || 'N/A',
        email: seller?.email || 'N/A',
        phone: seller?.phone || 'N/A',
      },

      // Order information
      order: {
        orderNumber: order.orderNumber,
        items: order.items,
        deliveryAddress: order.deliveryAddress,
      },

      // Payment information
      payment: {
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        channel: payment.channel,
        gateway: payment.gateway,
      },

      // Breakdown
      breakdown: {
        subtotal: order.totalAmount,
        total: payment.amount,
      },
    };

    return successResponse(receipt, 'Receipt fetched successfully');
  } catch (error) {
    console.error('Get receipt error:', error);
    return serverErrorResponse('Failed to fetch receipt');
  }
}
