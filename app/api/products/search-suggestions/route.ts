import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api-response';

// GET /api/products/search-suggestions - Get search suggestions
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = Number(searchParams.get('limit')) || 5;

    if (!query || query.length < 2) {
      return successResponse({
        products: [],
        categories: [],
        suggestions: [],
      });
    }

    // Search products
    const products = await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    })
      .select('name category price images')
      .limit(limit)
      .lean();

    // Search categories
    const categories = await Category.find({
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { slug: { $regex: query, $options: 'i' } },
      ],
    })
      .select('name slug icon')
      .limit(3)
      .lean();

    // Generate search suggestions based on common terms
    const suggestions = [
      ...products.map(p => p.name),
      ...categories.map(c => c.name),
    ].slice(0, limit);

    return successResponse({
      products,
      categories,
      suggestions,
    });
  } catch (error) {
    console.error('Get search suggestions error:', error);
    return serverErrorResponse('Failed to fetch search suggestions');
  }
}
