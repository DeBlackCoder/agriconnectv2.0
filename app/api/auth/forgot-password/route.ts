import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import PasswordReset from '@/models/PasswordReset';
import { sendEmail, getPasswordResetEmailTemplate } from '@/lib/email';
import crypto from 'crypto';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api-response';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate input
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse({ email: ['Invalid email address'] });
    }

    const { email } = validation.data;

    // Find user
    const user = await User.findOne({ email });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse(
        null,
        'If that email exists, a password reset link has been sent.'
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Create password reset record
    await PasswordReset.create({
      user: user._id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
      used: false,
    });

    // Send verification email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
    const emailTemplate = getPasswordResetEmailTemplate(user.name, resetUrl);

    try {
      await sendEmail({
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      // Still return success to prevent email enumeration
    }

    // In development, also log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('Password Reset URL:', resetUrl);
    }

    return successResponse(
      null,
      'If that email exists, a password reset link has been sent.'
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return serverErrorResponse('Failed to process password reset request');
  }
}
