import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export function successResponse<T>(data: T, message?: string, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

export function errorResponse(error: string, status = 400, errors?: Record<string, string[]>): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      errors,
    },
    { status }
  );
}

export function unauthorizedResponse(message = 'Unauthorized'): NextResponse<ApiResponse> {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message = 'Forbidden'): NextResponse<ApiResponse> {
  return errorResponse(message, 403);
}

export function notFoundResponse(message = 'Resource not found'): NextResponse<ApiResponse> {
  return errorResponse(message, 404);
}

export function validationErrorResponse(errors: Record<string, string[]>): NextResponse<ApiResponse> {
  return errorResponse('Validation failed', 400, errors);
}

export function serverErrorResponse(message = 'Internal server error'): NextResponse<ApiResponse> {
  return errorResponse(message, 500);
}

// Handle Zod validation errors
export function handleZodError(error: unknown): Record<string, string[]> {
  if (typeof error === 'object' && error !== null && 'issues' in error) {
    const issues = error.issues as Array<{ path: Array<string | number>; message: string }>;
    return issues.reduce((acc, issue) => {
      const key = issue.path.join('.');
      if (!acc[key]) acc[key] = [];
      acc[key].push(issue.message);
      return acc;
    }, {} as Record<string, string[]>);
  }
  return { general: ['Validation failed'] };
}
