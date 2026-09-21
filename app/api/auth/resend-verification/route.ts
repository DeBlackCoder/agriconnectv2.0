import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import EmailVerification from '@/models/EmailVerification';
import { sendEmail, getVerificationEmailTemplate } from '@/lib/email';
import { getCurrentUser } from '@/lib/auth';
import crypto from 'crypto';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get current user from cookie
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return errorResponse('Not authenticated', 401);
    }

    // Find user
    const user = await User.findById(currentUser.userId);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Check if already verified
    if (user.isVerified) {
      return successResponse(null, 'Email already verified');
    }

    // Invalidate old verification tokens
    await EmailVerification.updateMany(
      { user: user._id, verified: false },
      { expiresAt: new Date() } // Expire immediately
    );

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    // Create new email verification record
    await EmailVerification.create({
      user: user._id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 24 * 3600000), // 24 hours
      verified: false,
    });

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}`;
    const emailTemplate = getVerificationEmailTemplate(user.name, verificationUrl);

    await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    // In development, also log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('Verification URL:', verificationUrl);
    }

    return successResponse(
      null,
      'Verification email sent! Please check your inbox.'
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    return serverErrorResponse('Failed to resend verification email');
  }
}
