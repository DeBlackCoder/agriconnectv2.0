import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { requireAuth, isErrorResponse } from '@/lib/middleware';
import { updateReviewSchema } from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  handleZodError,
  serverErrorResponse,
  notFoundResponse,
  forbiddenResponse,
} from '@/lib/api-response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/reviews/[id] - Get single review
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { id } = await params;

    const review = await Review.findById(id)
      .populate('user', 'name avatar')
      .populate('product', 'name images')
      .lean();

    if (!review) {
      return notFoundResponse('Review not found');
    }

    return successResponse(review);
  } catch (error) {
    console.error('Get review error:', error);
    return serverErrorResponse('Failed to fetch review');
  }
}

// PATCH /api/reviews/[id] - Update review (owner only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateReviewSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(handleZodError(validation.error));
    }

    const updateData = validation.data;

    // Find review
    const review = await Review.findById(id);
    if (!review) {
      return notFoundResponse('Review not found');
    }

    // Verify ownership
    if (review.user.toString() !== user.userId) {
      return forbiddenResponse('You can only update your own reviews');
    }

    // Update review
    Object.assign(review, updateData);
    await review.save();

    // Recalculate product rating if rating changed
    if (updateData.rating) {
      const allReviews = await Review.find({
        product: review.product,
        isVisible: true,
      });
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / allReviews.length;

      await Product.findByIdAndUpdate(review.product, {
        averageRating: Math.round(averageRating * 10) / 10,
      });
    }

    // Populate review data
    await review.populate([
      { path: 'user', select: 'name avatar' },
      { path: 'product', select: 'name images' },
    ]);

    return successResponse(review, 'Review updated successfully');
  } catch (error) {
    console.error('Update review error:', error);
    return serverErrorResponse('Failed to update review');
  }
}

// DELETE /api/reviews/[id] - Delete review (owner only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    const { id } = await params;

    // Find review
    const review = await Review.findById(id);
    if (!review) {
      return notFoundResponse('Review not found');
    }

    // Verify ownership or admin
    if (review.user.toString() !== user.userId && user.role !== 'ADMIN') {
      return forbiddenResponse('You can only delete your own reviews');
    }

    const productId = review.product;

    // Delete review
    await Review.findByIdAndDelete(id);

    // Recalculate product rating
    const allReviews = await Review.find({
      product: productId,
      isVisible: true,
    });

    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / allReviews.length;

      await Product.findByIdAndUpdate(productId, {
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: allReviews.length,
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        averageRating: 0,
        reviewCount: 0,
      });
    }

    return successResponse(null, 'Review deleted successfully');
  } catch (error) {
    console.error('Delete review error:', error);
    return serverErrorResponse('Failed to delete review');
  }
}
