import { NextRequest } from 'next/server';
import { removeAuthCookie } from '@/lib/auth';
import { successResponse, serverErrorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    // Remove auth cookie
    await removeAuthCookie();

    return successResponse(null, 'Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    return serverErrorResponse('Logout failed');
  }
}
