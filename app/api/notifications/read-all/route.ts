import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { requireAuth, isErrorResponse } from '@/lib/middleware';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api-response';

// POST /api/notifications/read-all - Mark all notifications as read
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    const result = await Notification.updateMany(
      { user: user.userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return successResponse(
      { markedCount: result.modifiedCount },
      'All notifications marked as read'
    );
  } catch (error) {
    console.error('Mark all read error:', error);
    return serverErrorResponse('Failed to mark all notifications as read');
  }
}
