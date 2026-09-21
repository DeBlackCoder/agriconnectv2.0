import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';

export async function GET() {
  try {
    // Get current user from token
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    await connectDB();

    // Fetch full user data
    const user = await User.findById(currentUser.userId).select('-password');
    if (!user) {
      return unauthorizedResponse('User not found');
    }

    // Check if user is active
    if (!user.isActive) {
      return unauthorizedResponse('Account is deactivated');
    }

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

    return successResponse({ user: userData }, 'Session valid');
  } catch (error) {
    console.error('Session validation error:', error);
    return serverErrorResponse('Session validation failed');
  }
}
