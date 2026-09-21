import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Review from '@/models/Review';
import {
  calculateTrustScore,
  getSellerBadge,
  getBadgeInfo,
  calculateRatingDistribution,
  calculateRatingPercentages,
} from '@/lib/reputation-utils';
import {
  successResponse,
  serverErrorResponse,
  notFoundResponse,
  errorResponse,
} from '@/lib/api-response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/sellers/[id]/reputation - Get seller reputation
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { id: sellerId } = await params;

    // Find seller
    const seller = await User.findById(sellerId);
    if (!seller) {
      return notFoundResponse('Seller not found');
    }

    if (seller.role !== 'USER' && seller.role !== 'ADMIN') {
      return errorResponse('User is not a valid seller', 400);
    }

    // Get seller's products
    const products = await Product.find({ seller: sellerId, isActive: true });
    const productIds = products.map(p => p._id);

    // Get order statistics
    const [
      totalOrders,
      completedOrders,
      cancelledOrders,
      confirmedWithin24h,
    ] = await Promise.all([
      Order.countDocuments({ seller: sellerId }),
      Order.countDocuments({
        seller: sellerId,
        status: { $in: ['DELIVERED', 'COMPLETED'] },
      }),
      Order.countDocuments({
        seller: sellerId,
        status: 'CANCELLED',
      }),
      Order.countDocuments({
        seller: sellerId,
        status: { $ne: 'PLACED' },
        confirmedAt: {
          $lte: new Date(Date.now() + 24 * 60 * 60 * 1000),
          $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    // Calculate metrics
    const fulfillmentRate = totalOrders > 0
      ? completedOrders / totalOrders
      : 0;

    const responseRate = totalOrders > 0
      ? confirmedWithin24h / Math.max(totalOrders, 1)
      : 0;

    // Get reviews for seller's products
    const reviews = await Review.find({
      product: { $in: productIds },
      isVisible: true,
    }).lean();

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    // Calculate trust score
    const trustScore = calculateTrustScore({
      averageRating,
      fulfillmentRate,
      responseRate,
      totalOrders,
    });

    // Determine badge
    const badge = getSellerBadge(trustScore, completedOrders);
    const badgeInfo = getBadgeInfo(badge);

    // Calculate rating distribution
    const ratingDistribution = calculateRatingDistribution(reviews);
    const ratingPercentages = calculateRatingPercentages(ratingDistribution);

    // Get recent reviews
    const recentReviews = await Review.find({
      product: { $in: productIds },
      isVisible: true,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name avatar')
      .populate('product', 'name images')
      .lean();

    // Calculate performance trends (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    const [recentOrders, previousOrders] = await Promise.all([
      Order.countDocuments({
        seller: sellerId,
        status: { $in: ['DELIVERED', 'COMPLETED'] },
        createdAt: { $gte: thirtyDaysAgo },
      }),
      Order.countDocuments({
        seller: sellerId,
        status: { $in: ['DELIVERED', 'COMPLETED'] },
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
      }),
    ]);

    const orderTrend = previousOrders > 0
      ? ((recentOrders - previousOrders) / previousOrders) * 100
      : recentOrders > 0 ? 100 : 0;

    return successResponse({
      sellerId,
      sellerName: seller.name,
      trustScore: Math.round(trustScore * 10) / 10,
      badge: {
        type: badge,
        ...badgeInfo,
      },
      metrics: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        fulfillmentRate: Math.round(fulfillmentRate * 100),
        responseRate: Math.round(responseRate * 100),
        totalOrders,
        completedOrders,
        cancelledOrders,
        activeProducts: products.length,
        memberSince: seller.createdAt,
      },
      ratingDistribution: {
        counts: ratingDistribution,
        percentages: ratingPercentages,
      },
      performance: {
        orderTrend: Math.round(orderTrend * 10) / 10,
        recentOrders,
        previousOrders,
      },
      recentReviews,
    });
  } catch (error) {
    console.error('Get seller reputation error:', error);
    return serverErrorResponse('Failed to fetch seller reputation');
  }
}
