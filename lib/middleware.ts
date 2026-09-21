import { NextRequest } from 'next/server';
import { getCurrentUser, JWTPayload } from './auth';
import { unauthorizedResponse, forbiddenResponse } from './api-response';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(request: NextRequest): Promise<JWTPayload | Response> {
  const user = await getCurrentUser();
  
  if (!user) {
    return unauthorizedResponse('Authentication required');
  }

  return user;
}

/**
 * Middleware to require specific roles
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: Array<'USER' | 'ADMIN'>
): Promise<JWTPayload | Response> {
  const authResult = await requireAuth(request);
  
  // If auth failed, return the error response
  if (authResult instanceof Response) {
    return authResult;
  }

  const user = authResult;

  if (!allowedRoles.includes(user.role)) {
    return forbiddenResponse(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
  }

  return user;
}

/**
 * Check if response is an error response
 */
export function isErrorResponse(result: JWTPayload | Response): result is Response {
  return result instanceof Response;
}
