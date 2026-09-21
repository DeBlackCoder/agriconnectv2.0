import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import PriceHistory from '@/models/PriceHistory';
import Product from '@/models/Product';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response';

// GET /api/pricing/history - Get price history for a product or category
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const category = searchParams.get('category');
    const days = Number(searchParams.get('days')) || 90;
    const limit = Number(searchParams.get('limit')) || 100;

    if (!productId && !category) {
      return errorResponse('Either productId or category is required', 400);
    }

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const query: Record<string, unknown> = {
      recordedAt: { $gte: dateThreshold },
    };

    let productInfo = null;

    if (productId) {
      // Get specific product history
      const product = await Product.findById(productId);
      if (!product) {
        return notFoundResponse('Product not found');
      }

      query.product = productId;
      productInfo = {
        id: product._id,
        name: product.name,
        currentPrice: product.price,
        category: product.category,
      };
    } else if (category) {
      // Get category-wide price history
      query.category = category;
    }

    const priceHistory = await PriceHistory.find(query)
      .sort({ recordedAt: 1 })
      .limit(limit)
      .lean();

    if (priceHistory.length === 0) {
      return successResponse({
        productInfo,
        history: [],
        stats: null,
        message: 'No price history available',
      });
    }

    // Calculate statistics
    const prices = priceHistory.map(p => p.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Calculate volatility (standard deviation)
    const variance = prices.reduce((sum, price) => {
      return sum + Math.pow(price - avgPrice, 2);
    }, 0) / prices.length;
    const volatility = Math.sqrt(variance);

    // Group by date for time series
    const timeSeriesData = priceHistory.map(entry => ({
      date: entry.recordedAt,
      price: entry.price,
      isOrganic: entry.isOrganic,
      location: entry.location,
    }));

    return successResponse({
      productInfo,
      period: `${days} days`,
      history: timeSeriesData,
      stats: {
        averagePrice: Math.round(avgPrice * 100) / 100,
        minPrice: Math.round(minPrice * 100) / 100,
        maxPrice: Math.round(maxPrice * 100) / 100,
        volatility: Math.round(volatility * 100) / 100,
        dataPoints: priceHistory.length,
        priceChange: {
          amount: Math.round((prices[prices.length - 1] - prices[0]) * 100) / 100,
          percent: Math.round(((prices[prices.length - 1] - prices[0]) / prices[0]) * 100 * 10) / 10,
        },
      },
    });
  } catch (error) {
    console.error('Get price history error:', error);
    return serverErrorResponse('Failed to fetch price history');
  }
}
