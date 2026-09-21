import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import User from '@/models/User';
import { requireAuth, isErrorResponse } from '@/lib/middleware';
import { initializePaystackTransaction, generatePaymentReference, nairaToKobo } from '@/lib/paystack';
import { initializePaymentSchema } from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  handleZodError,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response';

// POST /api/payments/initialize - Initialize payment
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    const body = await request.json();

    // Validate input
    const validation = initializePaymentSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(handleZodError(validation.error));
    }

    const { orderId, amount, email } = validation.data;

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return notFoundResponse('Order not found');
    }

    // Verify order belongs to user
    if (order.buyer.toString() !== user.userId) {
      return errorResponse('Unauthorized to pay for this order', 403);
    }

    // Verify order amount matches
    if (Math.abs(order.totalAmount - amount) > 0.01) {
      return errorResponse('Payment amount does not match order total', 400);
    }

    // Check if order already paid
    if (order.paymentStatus === 'PAID') {
      return errorResponse('Order is already paid', 400);
    }

    // Check for existing pending payment
    const existingPayment = await Payment.findOne({
      order: orderId,
      status: 'PENDING',
    });

    if (existingPayment) {
      // Return existing payment details if less than 30 minutes old
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      if (existingPayment.createdAt > thirtyMinutesAgo) {
        try {
          // Try to initialize with existing reference
          const paystackResponse = await initializePaystackTransaction(
            email,
            nairaToKobo(amount),
            existingPayment.reference,
            {
              orderId: order._id.toString(),
              userId: user.userId,
              orderNumber: order.orderNumber,
            }
          );

          return successResponse({
            reference: existingPayment.reference,
            authorization_url: paystackResponse.data.authorization_url,
            access_code: paystackResponse.data.access_code,
            amount,
          }, 'Payment initialized successfully');
        } catch (error) {
          // If failed, create new payment below
          console.error('Failed to reuse payment reference:', error);
        }
      }
    }

    // Generate new payment reference
    const reference = generatePaymentReference('AGR');

    // Initialize Paystack transaction
    const paystackResponse = await initializePaystackTransaction(
      email,
      nairaToKobo(amount),
      reference,
      {
        orderId: order._id.toString(),
        userId: user.userId,
        orderNumber: order.orderNumber,
      }
    );

    // Create payment record
    const payment = await Payment.create({
      order: orderId,
      user: user.userId,
      reference,
      amount,
      currency: 'NGN',
      status: 'PENDING',
      gateway: 'PAYSTACK',
      gatewayReference: paystackResponse.data.access_code,
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      },
    });

    return successResponse(
      {
        paymentId: payment._id,
        reference: payment.reference,
        authorization_url: paystackResponse.data.authorization_url,
        access_code: paystackResponse.data.access_code,
        amount: payment.amount,
        currency: payment.currency,
      },
      'Payment initialized successfully',
      201
    );
  } catch (error) {
    console.error('Initialize payment error:', error);
    
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }
    
    return serverErrorResponse('Failed to initialize payment');
  }
}
