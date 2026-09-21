import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireRole, isErrorResponse } from '@/lib/middleware';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api-response';

// GET /api/products/my-products - Get current farmer's products
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRole(request, ['USER', 'ADMIN']);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active', 'inactive', 'all'
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;

    // Build query
    const query: Record<string, unknown> = { seller: user.userId };

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }
    // 'all' means no isActive filter

    // Build sort
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    // Calculate stats
    const stats = {
      total: await Product.countDocuments({ seller: user.userId }),
      active: await Product.countDocuments({ seller: user.userId, isActive: true }),
      lowStock: await Product.countDocuments({
        seller: user.userId,
        isActive: true,
        stock: { $lt: 10, $gt: 0 },
      }),
      outOfStock: await Product.countDocuments({
        seller: user.userId,
        isActive: true,
        stock: 0,
      }),
    };

    const totalPages = Math.ceil(totalCount / limit);

    return successResponse({
      products,
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
    console.error('Get my products error:', error);
    return serverErrorResponse('Failed to fetch products');
  }
}
