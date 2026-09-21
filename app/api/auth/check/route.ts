import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return errorResponse('Not authenticated', 401);
    }

    return successResponse({
      isAuthenticated: true,
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return errorResponse('Authentication check failed', 500);
  }
}
