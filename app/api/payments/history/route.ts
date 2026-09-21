import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import { requireAuth, isErrorResponse } from '@/lib/middleware';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api-response';

// GET /api/payments/history - Get user's payment history
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'SUCCESS', 'FAILED', 'PENDING'
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;

    // Build query
    const query: Record<string, unknown> = { user: user.userId };
    
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [payments, totalCount] = await Promise.all([
      Payment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('order', 'orderNumber totalAmount status')
        .lean(),
      Payment.countDocuments(query),
    ]);

    // Calculate statistics
    const stats = {
      totalPaid: await Payment.aggregate([
        { $match: { user: user.userId, status: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).then(result => result[0]?.total || 0),
      totalTransactions: await Payment.countDocuments({ user: user.userId }),
      successfulPayments: await Payment.countDocuments({
        user: user.userId,
        status: 'SUCCESS',
      }),
      failedPayments: await Payment.countDocuments({
        user: user.userId,
        status: 'FAILED',
      }),
      pendingPayments: await Payment.countDocuments({
        user: user.userId,
        status: 'PENDING',
      }),
    };

    const totalPages = Math.ceil(totalCount / limit);

    return successResponse({
      payments,
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
    console.error('Get payment history error:', error);
    return serverErrorResponse('Failed to fetch payment history');
  }
}
