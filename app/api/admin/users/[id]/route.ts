import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireRole, isErrorResponse } from '@/lib/middleware';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/admin/users/[id] - Update user role or status (Admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireRole(request, ['ADMIN']);
    if (isErrorResponse(authResult)) return authResult;

    await connectDB();
    
    // Ensure User model is registered
    User;

    const { id } = await params;
    const body = await request.json();
    const { role, isActive } = body;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return notFoundResponse('User not found');
    }

    // Update fields
    if (role && ['USER', 'ADMIN'].includes(role)) {
      user.role = role;
    }

    if (typeof isActive === 'boolean') {
      user.isActive = isActive;
    }

    await user.save();

    // Return user without password
    const userWithoutPassword = user.toObject();
    const { password, ...userResponse } = userWithoutPassword;

    return successResponse(
      userResponse,
      `User ${role ? 'role' : 'status'} updated successfully`
    );
  } catch (error) {
    console.error('Update user error:', error);
    return serverErrorResponse('Failed to update user');
  }
}

// GET /api/admin/users/[id] - Get user details (Admin only)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireRole(request, ['ADMIN']);
    if (isErrorResponse(authResult)) return authResult;

    await connectDB();
    
    // Ensure User model is registered
    User;

    const { id } = await params;

    const user = await User.findById(id).select('-password').lean();
    if (!user) {
      return notFoundResponse('User not found');
    }

    return successResponse(user);
  } catch (error) {
    console.error('Get user error:', error);
    return serverErrorResponse('Failed to fetch user');
  }
}

// DELETE /api/admin/users/[id] - Delete user (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireRole(request, ['ADMIN']);
    if (isErrorResponse(authResult)) return authResult;

    await connectDB();
    
    // Ensure User model is registered
    User;

    const { id } = await params;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return notFoundResponse('User not found');
    }

    // Prevent deleting yourself
    if (user._id.toString() === authResult.userId) {
      return errorResponse('You cannot delete your own account', 400);
    }

    // Soft delete - deactivate instead
    user.isActive = false;
    await user.save();

    return successResponse(null, 'User deactivated successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    return serverErrorResponse('Failed to delete user');
  }
}
