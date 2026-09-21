import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import PriceHistory from '@/models/PriceHistory';
import Product from '@/models/Product';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response';

// GET /api/pricing/market-average - Get market average price by category
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const isOrganic = searchParams.get('isOrganic') === 'true';
    const days = Number(searchParams.get('days')) || 30;

    if (!category) {
      return errorResponse('Category parameter is required', 400);
    }

    // Calculate date threshold (last N days)
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Build query
    const query: Record<string, unknown> = {
      category,
      recordedAt: { $gte: dateThreshold },
    };

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (isOrganic) {
      query.isOrganic = true;
    }

    // Get price history data
    const priceData = await PriceHistory.find(query).lean();

    if (priceData.length === 0) {
      return successResponse({
        category,
        location: location || 'all',
        isOrganic,
        period: `${days} days`,
        averagePrice: 0,
        minPrice: 0,
        maxPrice: 0,
        sampleSize: 0,
        trend: 'stable',
        message: 'No price data available for this category',
      });
    }

    // Calculate statistics
    const prices = priceData.map(p => p.price);
    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const sampleSize = prices.length;

    // Calculate trend (compare first half vs second half of period)
    const midPoint = Math.floor(priceData.length / 2);
    const firstHalf = priceData.slice(0, midPoint);
    const secondHalf = priceData.slice(midPoint);

    const firstHalfAvg = firstHalf.length > 0
      ? firstHalf.reduce((sum, p) => sum + p.price, 0) / firstHalf.length
      : 0;
    const secondHalfAvg = secondHalf.length > 0
      ? secondHalf.reduce((sum, p) => sum + p.price, 0) / secondHalf.length
      : 0;

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    const changePercent = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

    if (changePercent > 5) {
      trend = 'increasing';
    } else if (changePercent < -5) {
      trend = 'decreasing';
    }

    // Calculate percentiles for price ranges
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const percentile25 = sortedPrices[Math.floor(sortedPrices.length * 0.25)];
    const percentile75 = sortedPrices[Math.floor(sortedPrices.length * 0.75)];
    const median = sortedPrices[Math.floor(sortedPrices.length * 0.5)];

    // Get current active products count
    const activeProductsQuery: Record<string, unknown> = {
      category,
      isActive: true,
      stock: { $gt: 0 },
    };

    if (location) {
      activeProductsQuery.location = { $regex: location, $options: 'i' };
    }

    if (isOrganic) {
      activeProductsQuery.isOrganic = true;
    }

    const activeProductsCount = await Product.countDocuments(activeProductsQuery);

    return successResponse({
      category,
      location: location || 'all',
      isOrganic,
      period: `${days} days`,
      averagePrice: Math.round(averagePrice * 100) / 100,
      minPrice: Math.round(minPrice * 100) / 100,
      maxPrice: Math.round(maxPrice * 100) / 100,
      median: Math.round(median * 100) / 100,
      percentile25: Math.round(percentile25 * 100) / 100,
      percentile75: Math.round(percentile75 * 100) / 100,
      sampleSize,
      trend,
      trendPercentage: Math.round(changePercent * 10) / 10,
      activeProducts: activeProductsCount,
      priceRange: {
        low: Math.round(percentile25 * 100) / 100,
        mid: Math.round(median * 100) / 100,
        high: Math.round(percentile75 * 100) / 100,
      },
    });
  } catch (error) {
    console.error('Get market average error:', error);
    return serverErrorResponse('Failed to fetch market average');
  }
}
