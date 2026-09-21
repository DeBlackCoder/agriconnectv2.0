import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import PasswordReset from '@/models/PasswordReset';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api-response';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate input
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.issues.reduce((acc, issue) => {
        const key = issue.path.join('.') || 'general';
        if (!acc[key]) acc[key] = [];
        acc[key].push(issue.message);
        return acc;
      }, {} as Record<string, string[]>);
      return validationErrorResponse(errors);
    }

    const { token, password } = validation.data;

    // Hash the token to match stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid reset token
    const resetRecord = await PasswordReset.findOne({
      token: hashedToken,
      expiresAt: { $gt: new Date() },
      used: false,
    });

    if (!resetRecord) {
      return errorResponse('Invalid or expired reset token', 400);
    }

    // Find user
    const user = await User.findById(resetRecord.user);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Mark token as used
    resetRecord.used = true;
    await resetRecord.save();

    // Invalidate all other reset tokens for this user
    await PasswordReset.updateMany(
      { user: user._id, _id: { $ne: resetRecord._id } },
      { used: true }
    );

    return successResponse(null, 'Password reset successful. You can now login with your new password.');
  } catch (error) {
    console.error('Reset password error:', error);
    return serverErrorResponse('Failed to reset password');
  }
}
