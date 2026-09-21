import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import FarmerProfile from '@/models/FarmerProfile';
import BuyerProfile from '@/models/BuyerProfile';
import { requireAuth, isErrorResponse } from '@/lib/middleware';
import { updateProfileSchema, updateFarmerProfileSchema, updateBuyerProfileSchema } from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  handleZodError,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response';

// GET /api/users/profile - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    // Fetch user data
    const userData = await User.findById(user.userId).select('-password');
    if (!userData) {
      return notFoundResponse('User not found');
    }

    return successResponse({
      user: userData,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return serverErrorResponse('Failed to fetch profile');
  }
}

// PATCH /api/users/profile - Update current user profile
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    const body = await request.json();
    const { userUpdate, profileUpdate } = body;

    // Update base user profile
    if (userUpdate) {
      const validation = updateProfileSchema.safeParse(userUpdate);
      if (!validation.success) {
        return validationErrorResponse(handleZodError(validation.error));
      }

      await User.findByIdAndUpdate(
        user.userId,
        { $set: validation.data },
        { new: true, runValidators: true }
      );
    }

    // Fetch updated data
    const userData = await User.findById(user.userId).select('-password');

    return successResponse(
      { user: userData },
      'Profile updated successfully'
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return serverErrorResponse('Failed to update profile');
  }
}
