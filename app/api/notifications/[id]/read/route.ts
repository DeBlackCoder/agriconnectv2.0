import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { requireAuth, isErrorResponse } from '@/lib/middleware';
import {
  successResponse,
  serverErrorResponse,
  notFoundResponse,
  forbiddenResponse,
} from '@/lib/api-response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/notifications/[id]/read - Mark notification as read
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    const { id } = await params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return notFoundResponse('Notification not found');
    }

    // Verify ownership
    if (notification.user.toString() !== user.userId) {
      return forbiddenResponse('You can only mark your own notifications as read');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return successResponse(notification, 'Notification marked as read');
  } catch (error) {
    console.error('Mark notification read error:', error);
    return serverErrorResponse('Failed to mark notification as read');
  }
}
