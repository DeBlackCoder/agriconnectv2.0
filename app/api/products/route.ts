import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User'; // Import User model to register schema
import PriceHistory from '@/models/PriceHistory';
import { requireRole, isErrorResponse } from '@/lib/middleware';
import { createProductSchema, productFilterSchema } from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  handleZodError,
  serverErrorResponse,
} from '@/lib/api-response';

// GET /api/products - List products with advanced filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure User model is registered before populate
    User; // Force registration

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters with safe defaults
    const category = searchParams.get('category') || undefined;
    const minPriceStr = searchParams.get('minPrice');
    const maxPriceStr = searchParams.get('maxPrice');
    const isOrganicStr = searchParams.get('isOrganic');
    const location = searchParams.get('location') || undefined;
    const inStockStr = searchParams.get('inStock');
    const search = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const pageStr = searchParams.get('page');
    const limitStr = searchParams.get('limit');

    // Build query
    const query: Record<string, unknown> = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (minPriceStr || maxPriceStr) {
      query.price = {};
      if (minPriceStr) {
        const minPrice = Number(minPriceStr);
        if (!isNaN(minPrice)) {
          (query.price as Record<string, unknown>).$gte = minPrice;
        }
      }
      if (maxPriceStr) {
        const maxPrice = Number(maxPriceStr);
        if (!isNaN(maxPrice)) {
          (query.price as Record<string, unknown>).$lte = maxPrice;
        }
      }
    }

    if (isOrganicStr === 'true') {
      query.isOrganic = true;
    } else if (isOrganicStr === 'false') {
      query.isOrganic = false;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (inStockStr === 'true') {
      query.stock = { $gt: 0 };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const sortField = sortBy === 'price' ? 'price' :
                      sortBy === 'popularity' ? 'views' :
                      sortBy === 'rating' ? 'averageRating' :
                      'createdAt';
    
    const sortOrderNum = sortOrder === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortField]: sortOrderNum };

    // Calculate pagination
    const page = pageStr && !isNaN(Number(pageStr)) ? Number(pageStr) : 1;
    const limit = limitStr && !isNaN(Number(limitStr)) ? Math.min(Number(limitStr), 100) : 12;
    const skip = (page - 1) * limit;

    // Execute query
    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('seller', 'name email avatar')
        .lean(),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return successResponse({
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error('Get products error:', error);
    return serverErrorResponse(error?.message || 'Failed to fetch products');
  }
}

// POST /api/products - Create new product (Farmers only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRole(request, ['USER', 'ADMIN']);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();
    
    // Ensure User model is registered before populate
    User; // Force registration

    const body = await request.json();

    // Validate input
    const validation = createProductSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(handleZodError(validation.error));
    }

    const productData = validation.data;

    // Create product
    const product = await Product.create({
      ...productData,
      seller: user.userId,
      averageRating: 0,
      reviewCount: 0,
      views: 0,
      isActive: true,
    });

    // Record initial price in price history
    await PriceHistory.create({
      product: product._id,
      price: product.price,
      category: product.category,
      location: product.location,
      isOrganic: product.isOrganic,
      recordedAt: new Date(),
    });

    // Populate seller info
    await product.populate('seller', 'name email avatar');

    return successResponse(product, 'Product created successfully', 201);
  } catch (error) {
    console.error('Create product error:', error);
    return serverErrorResponse('Failed to create product');
  }
}
