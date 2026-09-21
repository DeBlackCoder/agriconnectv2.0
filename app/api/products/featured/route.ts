import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User'; // Import User model to register schema
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api-response';

// GET /api/products/featured - Get featured/popular products
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure User model is registered before populate
    User; // Force registration

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'popular'; // 'popular', 'top-rated', 'new', 'organic'
    const limit = Number(searchParams.get('limit')) || 8;

    let query: Record<string, unknown> = { isActive: true, stock: { $gt: 0 } };
    let sort: Record<string, 1 | -1> = {};

    switch (type) {
      case 'popular':
        sort = { views: -1, averageRating: -1 };
        break;
      case 'top-rated':
        query.averageRating = { $gte: 4 };
        query.reviewCount = { $gte: 5 };
        sort = { averageRating: -1, reviewCount: -1 };
        break;
      case 'new':
        sort = { createdAt: -1 };
        break;
      case 'organic':
        query.isOrganic = true;
        sort = { averageRating: -1, views: -1 };
        break;
      default:
        sort = { views: -1 };
    }

    const products = await Product.find(query)
      .sort(sort)
      .limit(limit)
      .populate('seller', 'name avatar')
      .lean();

    return successResponse({ products, type });
  } catch (error) {
    console.error('Get featured products error:', error);
    return serverErrorResponse('Failed to fetch featured products');
  }
}
