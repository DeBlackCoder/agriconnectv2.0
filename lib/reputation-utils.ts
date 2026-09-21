// Seller reputation calculation utilities

export interface ReputationMetrics {
  averageRating: number;
  totalReviews: number;
  fulfillmentRate: number;
  responseRate: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  trustScore: number;
  badge: 'ELITE' | 'TOP_RATED' | 'TRUSTED' | 'VERIFIED' | 'ACTIVE' | 'NEW';
}

/**
 * Calculate seller trust score (0-100)
 * 
 * Formula:
 * - 40% Average Rating
 * - 30% Fulfillment Rate
 * - 20% Response Rate
 * - 10% Order Volume Bonus
 */
export function calculateTrustScore(metrics: {
  averageRating: number;
  fulfillmentRate: number;
  responseRate: number;
  totalOrders: number;
}): number {
  // Average Rating component (0-40 points)
  const ratingScore = (metrics.averageRating / 5) * 40;

  // Fulfillment Rate component (0-30 points)
  const fulfillmentScore = metrics.fulfillmentRate * 30;

  // Response Rate component (0-20 points)
  const responseScore = metrics.responseRate * 20;

  // Order Volume Bonus (0-10 points)
  let volumeBonus = 0;
  if (metrics.totalOrders >= 100) {
    volumeBonus = 10;
  } else if (metrics.totalOrders >= 50) {
    volumeBonus = 7;
  } else if (metrics.totalOrders >= 20) {
    volumeBonus = 5;
  } else if (metrics.totalOrders >= 10) {
    volumeBonus = 3;
  } else if (metrics.totalOrders >= 5) {
    volumeBonus = 1;
  }

  const trustScore = ratingScore + fulfillmentScore + responseScore + volumeBonus;
  return Math.min(Math.round(trustScore * 10) / 10, 100);
}

/**
 * Determine seller badge based on trust score and metrics
 */
export function getSellerBadge(
  trustScore: number,
  completedOrders: number
): ReputationMetrics['badge'] {
  if (trustScore >= 90 && completedOrders >= 50) {
    return 'ELITE';
  } else if (trustScore >= 80 && completedOrders >= 20) {
    return 'TOP_RATED';
  } else if (trustScore >= 70 && completedOrders >= 10) {
    return 'TRUSTED';
  } else if (trustScore >= 60 && completedOrders >= 5) {
    return 'VERIFIED';
  } else if (completedOrders >= 5) {
    return 'ACTIVE';
  } else {
    return 'NEW';
  }
}

/**
 * Get badge display information
 */
export function getBadgeInfo(badge: ReputationMetrics['badge']): {
  label: string;
  description: string;
  icon: string;
  color: string;
} {
  const badgeInfo = {
    ELITE: {
      label: 'Elite Seller',
      description: 'Exceptional performance with 90+ trust score and 50+ completed orders',
      icon: '🏆',
      color: 'gold',
    },
    TOP_RATED: {
      label: 'Top Rated',
      description: 'High-quality service with 80+ trust score and 20+ completed orders',
      icon: '⭐',
      color: 'blue',
    },
    TRUSTED: {
      label: 'Trusted Seller',
      description: 'Reliable seller with 70+ trust score and 10+ completed orders',
      icon: '✅',
      color: 'green',
    },
    VERIFIED: {
      label: 'Verified Seller',
      description: 'Verified seller with 60+ trust score and 5+ completed orders',
      icon: '🔰',
      color: 'purple',
    },
    ACTIVE: {
      label: 'Active Seller',
      description: 'Active seller with 5+ completed orders',
      icon: '📦',
      color: 'orange',
    },
    NEW: {
      label: 'New Seller',
      description: 'New seller building reputation',
      icon: '🆕',
      color: 'gray',
    },
  };

  return badgeInfo[badge];
}

/**
 * Calculate rating distribution
 */
export function calculateRatingDistribution(reviews: Array<{ rating: number }>): {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
} {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  reviews.forEach((review) => {
    const rating = review.rating as 1 | 2 | 3 | 4 | 5;
    if (rating >= 1 && rating <= 5) {
      distribution[rating]++;
    }
  });

  return distribution;
}

/**
 * Calculate percentage distribution
 */
export function calculateRatingPercentages(distribution: {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}): {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
} {
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

  if (total === 0) {
    return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  }

  return {
    5: Math.round((distribution[5] / total) * 100),
    4: Math.round((distribution[4] / total) * 100),
    3: Math.round((distribution[3] / total) * 100),
    2: Math.round((distribution[2] / total) * 100),
    1: Math.round((distribution[1] / total) * 100),
  };
}
