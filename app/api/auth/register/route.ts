import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import VerificationCode from '@/models/VerificationCode';
import { hashPassword } from '@/lib/auth';
import { sendEmail, getVerificationCodeEmailTemplate } from '@/lib/email';
import { z } from 'zod';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  handleZodError,
  serverErrorResponse,
} from '@/lib/api-response';

// Updated registration schema without role
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
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
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(handleZodError(validation.error));
    }

    const { email, password, name, phone } = validation.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse('User with this email already exists', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with default USER role (not verified yet)
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'USER',
      phone,
      isActive: true,
      isVerified: false, // Email not verified yet
    });

    // Generate 5-digit verification code
    const code = generateVerificationCode();

    // Delete any existing codes for this email
    await VerificationCode.deleteMany({
      email,
      type: 'EMAIL_VERIFICATION',
    });

    // Create verification code record
    await VerificationCode.create({
      email,
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
      // Delete the user if email fails
      await User.findByIdAndDelete(user._id);
      return errorResponse('Failed to send verification email. Please try again.', 500);
    }

    // Return success (no token yet, user must verify first)
    return successResponse(
      { 
        email: user.email,
        message: 'Registration successful! Please check your email for the verification code.'
      },
      'Please verify your email to continue',
      201
    );
  } catch (error) {
    console.error('Registration error:', error);
    return serverErrorResponse('Registration failed');
  }
}
