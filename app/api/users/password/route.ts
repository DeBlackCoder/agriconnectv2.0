import { NextRequest } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth, isErrorResponse } from '@/lib/middleware';
import { verifyPassword, hashPassword } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  handleZodError,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// POST /api/users/password - Change password
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    const body = await request.json();

    // Validate input
    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(handleZodError(validation.error));
    }

    const { currentPassword, newPassword } = validation.data;

    // Fetch user with password
    const userData = await User.findById(user.userId).select('+password');
    if (!userData) {
      return notFoundResponse('User not found');
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, userData.password);
    if (!isPasswordValid) {
      return errorResponse('Current password is incorrect', 401);
    }

    // Check if new password is different from current
    const isSamePassword = await verifyPassword(newPassword, userData.password);
    if (isSamePassword) {
      return errorResponse('New password must be different from current password', 400);
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await User.findByIdAndUpdate(user.userId, {
      password: hashedPassword,
    });

    return successResponse(null, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return serverErrorResponse('Failed to change password');
  }
}
