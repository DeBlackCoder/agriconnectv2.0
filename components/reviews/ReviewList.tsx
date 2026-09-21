'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, ThumbsUp, User, CheckCircle } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { toast } from 'react-hot-toast';

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  helpfulVotes: string[];
  sellerResponse?: {
    text: string;
    respondedAt: string;
  };
  createdAt: string;
}

interface ReviewListProps {
  reviews: Review[];
  currentUserId?: string;
  onHelpfulClick?: (reviewId: string) => void;
}

export default function ReviewList({ reviews, currentUserId, onHelpfulClick }: ReviewListProps) {
  const [votingReviews, setVotingReviews] = useState<Set<string>>(new Set());

  const handleHelpful = async (reviewId: string) => {
    if (!currentUserId) {
      toast.error('Please login to vote');
      return;
    }

    setVotingReviews((prev) => new Set(prev).add(reviewId));

    try {
      const res = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
      });

      if (res.ok) {
        onHelpfulClick?.(reviewId);
        toast.success('Thank you for your feedback!');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to record vote');
      }
    } catch (error) {
      toast.error('Failed to record vote');
    } finally {
      setVotingReviews((prev) => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">No reviews yet</p>
        <p className="text-gray-500 text-sm mt-2">Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => {
        const hasVoted = review.helpfulVotes.includes(currentUserId || '');
        const isVoting = votingReviews.has(review._id);

        return (
          <div key={review._id} className="bg-white rounded-lg shadow-sm p-6">
            {/* Reviewer Info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  {review.user.avatar ? (
                    <Image
                      src={review.user.avatar}
                      alt={review.user.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{review.user.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {review.isVerifiedPurchase && (
                      <Badge variant="success" size="sm" className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verified Purchase
                      </Badge>
                    )}
                    <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Rating Stars */}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= review.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Review Comment */}
            <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

            {/* Review Images */}
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mb-4 flex-wrap">
                {review.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <Image
                      src={image}
                      alt={`Review image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Helpful Button */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleHelpful(review._id)}
                disabled={!currentUserId || hasVoted || isVoting}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  hasVoted
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-green-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-green-600' : ''}`} />
                <span>Helpful {review.helpfulCount > 0 && `(${review.helpfulCount})`}</span>
              </button>
            </div>

            {/* Seller Response */}
            {review.sellerResponse && (
              <div className="mt-4 bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-900">Seller Response</span>
                  <span className="text-sm text-gray-500">
                    {formatDate(review.sellerResponse.respondedAt)}
                  </span>
                </div>
                <p className="text-gray-700">{review.sellerResponse.text}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
