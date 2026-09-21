import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import PriceHistory from '@/models/PriceHistory';
import Product from '@/models/Product';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api-response';

// GET /api/pricing/analytics - Get comprehensive pricing analytics
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const days = Number(searchParams.get('days')) || 30;

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Get all price history within period
    const priceHistory = await PriceHistory.find({
      recordedAt: { $gte: dateThreshold },
    }).lean();

    // Calculate overall market statistics
    const allPrices = priceHistory.map(p => p.price);
    const overallAvg = allPrices.length > 0
      ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length
      : 0;

    // Group by category
    const categoryStats = new Map<string, number[]>();
    priceHistory.forEach(entry => {
      if (!categoryStats.has(entry.category)) {
        categoryStats.set(entry.category, []);
      }
      categoryStats.get(entry.category)!.push(entry.price);
    });

    // Calculate category averages and trends
    const categoryAnalytics = Array.from(categoryStats.entries()).map(([category, prices]) => {
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      
      // Calculate trend
      const midPoint = Math.floor(prices.length / 2);
      const firstHalf = prices.slice(0, midPoint);
      const secondHalf = prices.slice(midPoint);
      
      const firstAvg = firstHalf.length > 0
        ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
        : 0;
      const secondAvg = secondHalf.length > 0
        ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
        : 0;
      
      const trendPercent = firstAvg > 0
        ? ((secondAvg - firstAvg) / firstAvg) * 100
        : 0;

      return {
        category,
        averagePrice: Math.round(avg * 100) / 100,
        minPrice: Math.round(min * 100) / 100,
        maxPrice: Math.round(max * 100) / 100,
        sampleSize: prices.length,
        trend: trendPercent > 5 ? 'increasing' :
               trendPercent < -5 ? 'decreasing' : 'stable',
        trendPercent: Math.round(trendPercent * 10) / 10,
      };
    }).sort((a, b) => b.sampleSize - a.sampleSize);

    // Get organic vs non-organic comparison
    const organicPrices = priceHistory.filter(p => p.isOrganic).map(p => p.price);
    const nonOrganicPrices = priceHistory.filter(p => !p.isOrganic).map(p => p.price);

    const organicAvg = organicPrices.length > 0
      ? organicPrices.reduce((a, b) => a + b, 0) / organicPrices.length
      : 0;
    const nonOrganicAvg = nonOrganicPrices.length > 0
      ? nonOrganicPrices.reduce((a, b) => a + b, 0) / nonOrganicPrices.length
      : 0;

    const organicPremiumPercent = nonOrganicAvg > 0
      ? ((organicAvg - nonOrganicAvg) / nonOrganicAvg) * 100
      : 0;

    // Get location-based insights (top 5 locations)
    const locationStats = new Map<string, number[]>();
    priceHistory.forEach(entry => {
      if (!locationStats.has(entry.location)) {
        locationStats.set(entry.location, []);
      }
      locationStats.get(entry.location)!.push(entry.price);
    });

    const locationAnalytics = Array.from(locationStats.entries())
      .map(([location, prices]) => ({
        location,
        averagePrice: Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100,
        sampleSize: prices.length,
      }))
      .sort((a, b) => b.sampleSize - a.sampleSize)
      .slice(0, 5);

    // Get active products statistics
    const activeProducts = await Product.countDocuments({ isActive: true });
    const inStockProducts = await Product.countDocuments({
      isActive: true,
      stock: { $gt: 0 },
    });
    const organicProducts = await Product.countDocuments({
      isActive: true,
      isOrganic: true,
    });

    // Price distribution (buckets)
    const priceRanges = [
      { label: 'Under ₦500', min: 0, max: 500, count: 0 },
      { label: '₦500 - ₦1,000', min: 500, max: 1000, count: 0 },
      { label: '₦1,000 - ₦2,000', min: 1000, max: 2000, count: 0 },
      { label: '₦2,000 - ₦5,000', min: 2000, max: 5000, count: 0 },
      { label: 'Over ₦5,000', min: 5000, max: Infinity, count: 0 },
    ];

    allPrices.forEach(price => {
      const range = priceRanges.find(r => price >= r.min && price < r.max);
      if (range) range.count++;
    });

    return successResponse({
      period: `${days} days`,
      overview: {
        overallAveragePrice: Math.round(overallAvg * 100) / 100,
        totalPriceRecords: allPrices.length,
        activeProducts,
        inStockProducts,
        organicProducts,
      },
      categoryAnalytics,
      organicComparison: {
        organicAverage: Math.round(organicAvg * 100) / 100,
        nonOrganicAverage: Math.round(nonOrganicAvg * 100) / 100,
        premiumPercent: Math.round(organicPremiumPercent * 10) / 10,
        organicCount: organicPrices.length,
        nonOrganicCount: nonOrganicPrices.length,
      },
      locationAnalytics,
      priceDistribution: priceRanges,
    });
  } catch (error) {
    console.error('Get pricing analytics error:', error);
    return serverErrorResponse('Failed to fetch pricing analytics');
  }
}
