import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import PriceHistory from '@/models/PriceHistory';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response';

// GET /api/pricing/benchmark - Benchmark product price against market
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const price = searchParams.get('price') ? Number(searchParams.get('price')) : null;

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return notFoundResponse('Product not found');
    }

    const testPrice = price !== null ? price : product.price;

    // Get market data for comparison
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - 30);

    const marketPrices = await PriceHistory.find({
      category: product.category,
      location: { $regex: product.location, $options: 'i' },
      recordedAt: { $gte: dateThreshold },
    }).lean();

    if (marketPrices.length < 3) {
      return successResponse({
        productId: product._id,
        productName: product.name,
        yourPrice: testPrice,
        position: 'insufficient-data',
        message: 'Not enough market data for accurate benchmarking',
        competitorCount: 0,
      });
    }

    // Calculate statistics
    const prices = marketPrices.map(p => p.price).sort((a, b) => a - b);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Calculate percentile rank
    const lowerCount = prices.filter(p => p < testPrice).length;
    const percentileRank = (lowerCount / prices.length) * 100;

    // Determine position
    let position: 'very-low' | 'low' | 'competitive' | 'high' | 'very-high';
    let recommendation: string;

    if (percentileRank < 15) {
      position = 'very-low';
      recommendation = 'Your price is significantly below market average. Consider increasing to improve profit margins.';
    } else if (percentileRank < 35) {
      position = 'low';
      recommendation = 'Your price is below market average. You may be leaving money on the table.';
    } else if (percentileRank <= 65) {
      position = 'competitive';
      recommendation = 'Your price is competitive and well-positioned in the market.';
    } else if (percentileRank <= 85) {
      position = 'high';
      recommendation = 'Your price is above market average. This may reduce demand.';
    } else {
      position = 'very-high';
      recommendation = 'Your price is significantly above market average. Consider lowering to increase sales.';
    }

    // Calculate competitive advantage
    const priceDifferenceFromAvg = testPrice - avgPrice;
    const priceDifferencePercent = ((priceDifferenceFromAvg / avgPrice) * 100);

    // Find similar products (competitors)
    const competitors = await Product.find({
      _id: { $ne: productId },
      category: product.category,
      isActive: true,
      stock: { $gt: 0 },
      location: { $regex: product.location, $options: 'i' },
    })
      .select('name price seller averageRating')
      .sort({ averageRating: -1 })
      .limit(5)
      .lean();

    // Optimal price range (25th to 75th percentile)
    const optimalMin = prices[Math.floor(prices.length * 0.25)];
    const optimalMax = prices[Math.floor(prices.length * 0.75)];

    return successResponse({
      productId: product._id,
      productName: product.name,
      category: product.category,
      yourPrice: Math.round(testPrice * 100) / 100,
      marketData: {
        averagePrice: Math.round(avgPrice * 100) / 100,
        minPrice: Math.round(minPrice * 100) / 100,
        maxPrice: Math.round(maxPrice * 100) / 100,
        sampleSize: prices.length,
      },
      benchmarking: {
        percentileRank: Math.round(percentileRank * 10) / 10,
        position,
        priceDifferenceFromAvg: Math.round(priceDifferenceFromAvg * 100) / 100,
        priceDifferencePercent: Math.round(priceDifferencePercent * 10) / 10,
      },
      optimalPriceRange: {
        min: Math.round(optimalMin * 100) / 100,
        max: Math.round(optimalMax * 100) / 100,
        recommended: Math.round(avgPrice * 100) / 100,
      },
      recommendation,
      competitors: competitors.map(c => ({
        id: c._id,
        name: c.name,
        price: c.price,
        rating: c.averageRating,
        priceDifference: Math.round((testPrice - c.price) * 100) / 100,
      })),
      competitorCount: competitors.length,
    });
  } catch (error) {
    console.error('Benchmark error:', error);
    return serverErrorResponse('Failed to benchmark product');
  }
}
