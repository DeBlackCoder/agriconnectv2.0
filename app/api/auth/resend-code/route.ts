import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import VerificationCode from '@/models/VerificationCode';
import { sendEmail, getVerificationCodeEmailTemplate } from '@/lib/email';
import { z } from 'zod';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  handleZodError,
  serverErrorResponse,
} from '@/lib/api-response';

const resendCodeSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Generate 5-digit verification code
function generateVerificationCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate input
    const validation = resendCodeSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(handleZodError(validation.error));
    }

    const { email } = validation.data;

    // Find the user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Check if already verified
    if (user.isVerified) {
      return errorResponse('Email already verified', 400);
    }

    // Check for recent code (rate limiting)
    const recentCode = await VerificationCode.findOne({
      email: email.toLowerCase(),
      type: 'EMAIL_VERIFICATION',
      createdAt: { $gt: new Date(Date.now() - 60000) }, // Last minute
    });

    if (recentCode) {
      return errorResponse(
        'Please wait at least 1 minute before requesting a new code',
        429
      );
    }

    // Generate new 5-digit verification code
    const code = generateVerificationCode();

    // Delete any existing codes for this email
    await VerificationCode.deleteMany({
      email: email.toLowerCase(),
      type: 'EMAIL_VERIFICATION',
    });

    // Create new verification code record
    await VerificationCode.create({
      email: email.toLowerCase(),
      code,
      type: 'EMAIL_VERIFICATION',
      expiresAt: new Date(Date.now() + 15 * 60000), // 15 minutes
      attempts: 0,
      used: false,
    });

    // Send verification email
    const emailTemplate = getVerificationCodeEmailTemplate(user.name, code);

    try {
      await sendEmail({
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return errorResponse('Failed to send verification email. Please try again.', 500);
    }

    return successResponse(
      { email: user.email },
      'Verification code sent! Please check your email.'
    );
  } catch (error) {
    console.error('Resend code error:', error);
    return serverErrorResponse('Failed to resend verification code');
  }
}
