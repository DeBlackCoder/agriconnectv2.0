import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import PriceHistory from '@/models/PriceHistory';
import { requireRole, isErrorResponse } from '@/lib/middleware';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response';

interface PricingSuggestion {
  suggestedPrice: number;
  confidence: 'low' | 'medium' | 'high';
  reasoning: string[];
  factors: {
    marketAverage: number;
    organicPremium?: number;
    stockScarcity?: number;
    locationAdjustment?: number;
    competitionDensity?: number;
    ratingBonus?: number;
  };
  priceRange: {
    min: number;
    recommended: number;
    max: number;
  };
}

// POST /api/pricing/suggestions - Get AI-powered pricing suggestions
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRole(request, ['USER', 'ADMIN']);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    const body = await request.json();
    const { productId, category, isOrganic, location, stock, averageRating } = body;

    // Validate input
    if (!productId && !category) {
      return errorResponse('Either productId or category is required', 400);
    }

    let product = null;
    let productData = {
      category: category || '',
      isOrganic: isOrganic || false,
      location: location || '',
      stock: stock !== undefined ? stock : 100,
      averageRating: averageRating || 0,
    };

    // If product ID provided, fetch product details
    if (productId) {
      product = await Product.findById(productId);
      if (!product) {
        return notFoundResponse('Product not found');
      }

      // Verify ownership
      if (product.seller.toString() !== user.userId) {
        return errorResponse('You can only get suggestions for your own products', 403);
      }

      productData = {
        category: product.category,
        isOrganic: product.isOrganic,
        location: product.location,
        stock: product.stock,
        averageRating: product.averageRating,
      };
    }

    // Get market data
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - 30);

    const marketPrices = await PriceHistory.find({
      category: productData.category,
      recordedAt: { $gte: dateThreshold },
    }).lean();

    if (marketPrices.length < 3) {
      return errorResponse('Insufficient market data for pricing suggestions', 400);
    }

    // Calculate base market average
    const prices = marketPrices.map(p => p.price);
    const marketAverage = prices.reduce((a, b) => a + b, 0) / prices.length;

    // Initialize pricing factors
    const factors: PricingSuggestion['factors'] = {
      marketAverage: Math.round(marketAverage * 100) / 100,
    };

    const reasoning: string[] = [];
    let suggestedPrice = marketAverage;
    let confidenceScore = 50; // Base confidence

    // Factor 1: Organic premium (+15%)
    if (productData.isOrganic) {
      const organicPremium = marketAverage * 0.15;
      factors.organicPremium = Math.round(organicPremium * 100) / 100;
      suggestedPrice += organicPremium;
      reasoning.push('Added 15% premium for organic certification');
      confidenceScore += 10;
    }

    // Factor 2: Stock scarcity (+5% if low stock)
    if (productData.stock < 20 && productData.stock > 0) {
      const scarcityBonus = marketAverage * 0.05;
      factors.stockScarcity = Math.round(scarcityBonus * 100) / 100;
      suggestedPrice += scarcityBonus;
      reasoning.push('Added 5% for low stock (scarcity pricing)');
      confidenceScore += 5;
    }

    // Factor 3: Location-based pricing
    const localPrices = marketPrices.filter(p =>
      p.location.toLowerCase().includes(productData.location.toLowerCase())
    );

    if (localPrices.length >= 3) {
      const localAvg = localPrices.reduce((sum, p) => sum + p.price, 0) / localPrices.length;
      const locationDiff = localAvg - marketAverage;
      factors.locationAdjustment = Math.round(locationDiff * 100) / 100;
      suggestedPrice += locationDiff;
      
      if (locationDiff > 0) {
        reasoning.push(`Added ${Math.abs(Math.round((locationDiff / marketAverage) * 100))}% for high-demand location`);
      } else if (locationDiff < 0) {
        reasoning.push(`Reduced ${Math.abs(Math.round((locationDiff / marketAverage) * 100))}% for competitive location`);
      }
      confidenceScore += 15;
    }

    // Factor 4: Competition density
    const competitorCount = await Product.countDocuments({
      category: productData.category,
      isActive: true,
      stock: { $gt: 0 },
      location: { $regex: productData.location, $options: 'i' },
    });

    if (competitorCount > 20) {
      const competitionAdjustment = marketAverage * -0.03;
      factors.competitionDensity = Math.round(competitionAdjustment * 100) / 100;
      suggestedPrice += competitionAdjustment;
      reasoning.push('Reduced 3% due to high competition in your area');
      confidenceScore += 10;
    } else if (competitorCount < 5) {
      const competitionAdjustment = marketAverage * 0.05;
      factors.competitionDensity = Math.round(competitionAdjustment * 100) / 100;
      suggestedPrice += competitionAdjustment;
      reasoning.push('Added 5% due to low competition in your area');
      confidenceScore += 10;
    }

    // Factor 5: Quality/Rating bonus
    if (productData.averageRating >= 4.5) {
      const ratingBonus = marketAverage * 0.08;
      factors.ratingBonus = Math.round(ratingBonus * 100) / 100;
      suggestedPrice += ratingBonus;
      reasoning.push('Added 8% premium for excellent ratings (4.5+)');
      confidenceScore += 10;
    } else if (productData.averageRating >= 4.0) {
      const ratingBonus = marketAverage * 0.04;
      factors.ratingBonus = Math.round(ratingBonus * 100) / 100;
      suggestedPrice += ratingBonus;
      reasoning.push('Added 4% premium for good ratings (4.0+)');
      confidenceScore += 5;
    }

    // Calculate confidence level
    let confidence: 'low' | 'medium' | 'high';
    if (confidenceScore >= 80) {
      confidence = 'high';
    } else if (confidenceScore >= 60) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }

    // Calculate price range
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const percentile25 = sortedPrices[Math.floor(sortedPrices.length * 0.25)];
    const percentile75 = sortedPrices[Math.floor(sortedPrices.length * 0.75)];

    const suggestion: PricingSuggestion = {
      suggestedPrice: Math.round(suggestedPrice * 100) / 100,
      confidence,
      reasoning,
      factors,
      priceRange: {
        min: Math.round(percentile25 * 100) / 100,
        recommended: Math.round(suggestedPrice * 100) / 100,
        max: Math.round(percentile75 * 100) / 100,
      },
    };

    // Add comparison with current price if product exists
    let comparison = null;
    if (product) {
      const priceDifference = suggestion.suggestedPrice - product.price;
      const percentChange = (priceDifference / product.price) * 100;

      comparison = {
        currentPrice: product.price,
        suggestedPrice: suggestion.suggestedPrice,
        difference: Math.round(priceDifference * 100) / 100,
        percentChange: Math.round(percentChange * 10) / 10,
        action: percentChange > 5 ? 'increase' :
                percentChange < -5 ? 'decrease' : 'maintain',
      };
    }

    return successResponse({
      ...suggestion,
      comparison,
      marketData: {
        sampleSize: prices.length,
        competitorCount,
        period: '30 days',
      },
    }, 'Pricing suggestions generated successfully');
  } catch (error) {
    console.error('Pricing suggestions error:', error);
    return serverErrorResponse('Failed to generate pricing suggestions');
  }
}
