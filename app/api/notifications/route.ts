import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { requireAuth, isErrorResponse } from '@/lib/middleware';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api-response';

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;

    // Build query
    const query: Record<string, unknown> = { user: user.userId };

    if (unreadOnly) {
      query.isRead = false;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [notifications, totalCount, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ user: user.userId, isRead: false }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return successResponse({
      notifications,
      unreadCount,
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
    console.error('Get notifications error:', error);
    return serverErrorResponse('Failed to fetch notifications');
  }
}
