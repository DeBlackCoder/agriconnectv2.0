import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  handleZodError,
  serverErrorResponse,
} from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(handleZodError(validation.error));
    }

    const { email, password } = validation.data;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse('Account is deactivated. Please contact support.', 403);
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401);
    }

    // Create JWT token
    const token = await createToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Set auth cookie
    await setAuthCookie(token);

    // Return user data (without password)
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
      'Login successful'
    );
  } catch (error) {
    console.error('Login error:', error);
    return serverErrorResponse('Login failed');
  }
}
