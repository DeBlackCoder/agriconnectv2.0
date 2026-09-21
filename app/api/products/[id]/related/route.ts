import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User'; // Import User model to register schema
import {
  successResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/products/[id]/related - Get related products
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    
    // Ensure User model is registered before populate
    User; // Force registration

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 6;

    // Find the current product
    const product = await Product.findById(id);
    if (!product) {
      return notFoundResponse('Product not found');
    }

    // Find related products based on:
    // 1. Same category
    // 2. Similar location
    // 3. Similar organic status
    // 4. Exclude current product and inactive products
    const relatedProducts = await Product.find({
      _id: { $ne: id },
      isActive: true,
      $or: [
        { category: product.category },
        { location: product.location },
        { isOrganic: product.isOrganic },
      ],
    })
      .sort({ averageRating: -1, views: -1 })
      .limit(limit)
      .populate('seller', 'name avatar')
      .lean();

    // If not enough related products, fill with popular products
    if (relatedProducts.length < limit) {
      const additionalProducts = await Product.find({
        _id: { 
          $ne: id, 
          $nin: relatedProducts.map(p => p._id) 
        },
        isActive: true,
      })
        .sort({ averageRating: -1, views: -1 })
        .limit(limit - relatedProducts.length)
        .populate('seller', 'name avatar')
        .lean();

      relatedProducts.push(...additionalProducts);
    }

    return successResponse({ products: relatedProducts });
  } catch (error) {
    console.error('Get related products error:', error);
    return serverErrorResponse('Failed to fetch related products');
  }
}
