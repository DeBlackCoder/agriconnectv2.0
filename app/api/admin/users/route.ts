import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireRole, isErrorResponse } from '@/lib/middleware';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api-response';

// GET /api/admin/users - List all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRole(request, ['ADMIN']);
    if (isErrorResponse(authResult)) return authResult;

    await connectDB();
    
    // Ensure User model is registered
    User;

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;

    // Build query
    const query: Record<string, unknown> = {};
    
    if (role && ['USER', 'ADMIN'].includes(role)) {
      query.role = role;
    }

    if (isActive === 'true') {
      query.isActive = true;
    } else if (isActive === 'false') {
      query.isActive = false;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [users, totalCount] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    // Calculate stats
    const stats = {
      total: await User.countDocuments(),
      active: await User.countDocuments({ isActive: true }),
      inactive: await User.countDocuments({ isActive: false }),
      admins: await User.countDocuments({ role: 'ADMIN' }),
      users: await User.countDocuments({ role: 'USER' }),
    };

    const totalPages = Math.ceil(totalCount / limit);

    return successResponse({
      users,
      stats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return serverErrorResponse('Failed to fetch users');
  }
}
