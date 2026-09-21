import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Wishlist from '@/models/Wishlist';
import Product from '@/models/Product';
import { requireAuth, isErrorResponse } from '@/lib/middleware';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response';

// GET /api/wishlist - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    let wishlist = await Wishlist.findOne({ user: user.userId })
      .populate({
        path: 'items.product',
        select: 'name price images category stock isActive averageRating seller',
        populate: { path: 'seller', select: 'name' },
      })
      .lean();

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: user.userId,
        items: [],
      });
    }

    // Filter out inactive products
    const activeItems = wishlist.items.filter(
      (item: any) => item.product && item.product.isActive
    );

    return successResponse({
      items: activeItems,
      count: activeItems.length,
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    return serverErrorResponse('Failed to fetch wishlist');
  }
}

// POST /api/wishlist - Add product to wishlist
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return errorResponse('Product not found or inactive', 404);
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: user.userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: user.userId,
        items: [{
          product: productId,
          addedAt: new Date(),
        }],
      });
    } else {
      // Check if product already in wishlist
      const exists = wishlist.items.some(
        (item) => item.product.toString() === productId
      );

      if (exists) {
        return errorResponse('Product already in wishlist', 400);
      }

      // Add to wishlist
      wishlist.items.push({
        product: productId,
        addedAt: new Date(),
      } as any);

      await wishlist.save();
    }

    // Populate and return
    await wishlist.populate({
      path: 'items.product',
      select: 'name price images category stock isActive averageRating',
    });

    return successResponse(
      { wishlist, count: wishlist.items.length },
      'Product added to wishlist',
      201
    );
  } catch (error) {
    console.error('Add to wishlist error:', error);
    return serverErrorResponse('Failed to add to wishlist');
  }
}

// DELETE /api/wishlist - Remove product from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    const wishlist = await Wishlist.findOne({ user: user.userId });

    if (!wishlist) {
      return errorResponse('Wishlist not found', 404);
    }

    // Remove product from wishlist
    wishlist.items = wishlist.items.filter(
      (item) => item.product.toString() !== productId
    );

    await wishlist.save();

    return successResponse(
      { count: wishlist.items.length },
      'Product removed from wishlist'
    );
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return serverErrorResponse('Failed to remove from wishlist');
  }
}
