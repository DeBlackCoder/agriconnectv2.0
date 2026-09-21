import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import VerificationCode from '@/models/VerificationCode';
import { createToken, setAuthCookie } from '@/lib/auth';
import { sendEmail, getWelcomeEmailTemplate } from '@/lib/email';
import { z } from 'zod';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  handleZodError,
  serverErrorResponse,
} from '@/lib/api-response';

const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(5, 'Code must be 5 digits'),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate input
    const validation = verifyEmailSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(handleZodError(validation.error));
    }

    const { email, code } = validation.data;

    // Find the verification code
    const verificationRecord = await VerificationCode.findOne({
      email: email.toLowerCase(),
      code,
      type: 'EMAIL_VERIFICATION',
      used: false,
      expiresAt: { $gt: new Date() }, // Not expired
    });

    if (!verificationRecord) {
      // Increment attempts if record exists
      await VerificationCode.findOneAndUpdate(
        {
          email: email.toLowerCase(),
          type: 'EMAIL_VERIFICATION',
          used: false,
        },
        { $inc: { attempts: 1 } }
      );

      return errorResponse('Invalid or expired verification code', 400);
    }

    // Check if too many attempts
    if (verificationRecord.attempts >= 5) {
      return errorResponse('Too many failed attempts. Please request a new code.', 429);
    }

    // Find the user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Check if already verified
    if (user.isVerified) {
      return errorResponse('Email already verified', 400);
    }

    // Mark user as verified
    user.isVerified = true;
    await user.save();

    // Mark verification code as used
    verificationRecord.used = true;
    await verificationRecord.save();

    // Send welcome email
    try {
      const welcomeEmail = getWelcomeEmailTemplate(user.name);
      await sendEmail({
        to: user.email,
        subject: welcomeEmail.subject,
        html: welcomeEmail.html,
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail verification if welcome email fails
    }

    // Create JWT token
    const token = await createToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Set auth cookie
    await setAuthCookie(token);

    // Return user data
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      isActive: user.isActive,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    return successResponse(
      { user: userData, token },
      'Email verified successfully! Welcome to AgriConnect.'
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return serverErrorResponse('Email verification failed');
  }
}
