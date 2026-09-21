import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import { requireAuth, isErrorResponse } from '@/lib/middleware';
import {
  successResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/reviews/[id]/helpful - Mark review as helpful
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    const { id } = await params;

    const review = await Review.findById(id);
    if (!review) {
      return notFoundResponse('Review not found');
    }

    // Check if user already voted
    const hasVoted = review.helpfulVotes.some(
      (vote) => vote.toString() === user.userId
    );

    if (hasVoted) {
      // Remove vote (toggle)
      review.helpfulVotes = review.helpfulVotes.filter(
        (vote) => vote.toString() !== user.userId
      );
      review.helpfulCount = review.helpfulVotes.length;
      await review.save();

      return successResponse({
        helpful: false,
        helpfulCount: review.helpfulCount,
      }, 'Vote removed');
    } else {
      // Add vote
      review.helpfulVotes.push(user.userId as any);
      review.helpfulCount = review.helpfulVotes.length;
      await review.save();

      return successResponse({
        helpful: true,
        helpfulCount: review.helpfulCount,
      }, 'Marked as helpful');
    }
  } catch (error) {
    console.error('Mark helpful error:', error);
    return serverErrorResponse('Failed to process vote');
  }
}
