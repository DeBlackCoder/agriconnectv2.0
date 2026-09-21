import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Notification from '@/models/Notification';
import { requireAuth, isErrorResponse } from '@/lib/middleware';
import { createReviewSchema } from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  handleZodError,
  serverErrorResponse,
} from '@/lib/api-response';

// GET /api/reviews - List reviews
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');
    const rating = searchParams.get('rating');
    const verified = searchParams.get('verified') === 'true';
    const sortBy = searchParams.get('sortBy') || 'recent'; // 'recent', 'helpful', 'rating-high', 'rating-low'
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;

    // Build query
    const query: Record<string, unknown> = { isVisible: true };

    if (productId) {
      query.product = productId;
    }

    if (userId) {
      query.user = userId;
    }

    if (rating) {
      query.rating = Number(rating);
    }

    if (verified) {
      query.isVerifiedPurchase = true;
    }

    // Build sort
    let sort: Record<string, 1 | -1> = {};
    switch (sortBy) {
      case 'helpful':
        sort = { helpfulCount: -1, createdAt: -1 };
        break;
      case 'rating-high':
        sort = { rating: -1, createdAt: -1 };
        break;
      case 'rating-low':
        sort = { rating: 1, createdAt: -1 };
        break;
      default: // recent
        sort = { createdAt: -1 };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [reviews, totalCount] = await Promise.all([
      Review.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('user', 'name avatar')
        .populate('product', 'name images')
        .lean(),
      Review.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return successResponse({
      reviews,
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
    console.error('Get reviews error:', error);
    return serverErrorResponse('Failed to fetch reviews');
  }
}

// POST /api/reviews - Create review
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    const body = await request.json();

    // Validate input
    const validation = createReviewSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(handleZodError(validation.error));
    }

    const { product: productId, rating, comment, images } = validation.data;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse('Product not found', 404);
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: user.userId,
    });

    if (existingReview) {
      return errorResponse('You have already reviewed this product', 400);
    }

    // Check if user purchased this product
    const purchaseOrder = await Order.findOne({
      buyer: user.userId,
      'items.product': productId,
      status: { $in: ['DELIVERED', 'COMPLETED'] },
    });

    const isVerifiedPurchase = !!purchaseOrder;

    // Create review
    const review = await Review.create({
      product: productId,
      user: user.userId,
      order: purchaseOrder?._id,
      rating,
      comment,
      images: images || [],
      isVerifiedPurchase,
      helpfulVotes: [],
      helpfulCount: 0,
      isVisible: true,
    });

    // Update product rating
    const allReviews = await Review.find({ product: productId, isVisible: true });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allReviews.length;

    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: allReviews.length,
    });

    // Create notification for seller
    await Notification.create({
      user: product.seller,
      type: 'NEW_REVIEW',
      title: 'New Review Received',
      message: `You received a ${rating}-star review for ${product.name}`,
      data: { productId: product._id, reviewId: review._id },
      link: `/products/${product._id}`,
      priority: rating <= 2 ? 'HIGH' : 'MEDIUM',
    });

    // Populate review data
    await review.populate([
      { path: 'user', select: 'name avatar' },
      { path: 'product', select: 'name images' },
    ]);

    return successResponse(review, 'Review created successfully', 201);
  } catch (error) {
    console.error('Create review error:', error);
    return serverErrorResponse('Failed to create review');
  }
}
