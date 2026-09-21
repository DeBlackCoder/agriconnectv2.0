import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User'; // Import User model to register schema
import PriceHistory from '@/models/PriceHistory';
import { requireAuth, requireRole, isErrorResponse } from '@/lib/middleware';
import { updateProductSchema } from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  handleZodError,
  serverErrorResponse,
  notFoundResponse,
  forbiddenResponse,
} from '@/lib/api-response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/products/[id] - Get single product details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    
    // Ensure User model is registered before populate
    User; // Force registration

    const { id } = await params;

    const product = await Product.findById(id)
      .populate('seller', 'name email avatar phone')
      .lean();

    if (!product) {
      return notFoundResponse('Product not found');
    }

    // Increment view count (fire and forget)
    Product.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();

    return successResponse(product);
  } catch (error) {
    console.error('Get product error:', error);
    return serverErrorResponse('Failed to fetch product');
  }
}

// PATCH /api/products/[id] - Update product (Owner only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireRole(request, ['USER', 'ADMIN']);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();
    
    // Ensure User model is registered before populate
    User; // Force registration

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateProductSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(handleZodError(validation.error));
    }

    const updateData = validation.data;

    // Find product and verify ownership
    const product = await Product.findById(id);
    if (!product) {
      return notFoundResponse('Product not found');
    }

    if (product.seller.toString() !== user.userId) {
      return forbiddenResponse('You can only update your own products');
    }

    // Track price change
    if (updateData.price && updateData.price !== product.price) {
      await PriceHistory.create({
        product: product._id,
        price: updateData.price,
        category: updateData.category || product.category,
        location: updateData.location || product.location,
        isOrganic: updateData.isOrganic !== undefined ? updateData.isOrganic : product.isOrganic,
        recordedAt: new Date(),
      });
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('seller', 'name email avatar');

    return successResponse(updatedProduct, 'Product updated successfully');
  } catch (error) {
    console.error('Update product error:', error);
    return serverErrorResponse('Failed to update product');
  }
}

// DELETE /api/products/[id] - Delete product (Owner only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireRole(request, ['USER', 'ADMIN']);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    const { id } = await params;

    // Find product and verify ownership
    const product = await Product.findById(id);
    if (!product) {
      return notFoundResponse('Product not found');
    }

    if (product.seller.toString() !== user.userId) {
      return forbiddenResponse('You can only delete your own products');
    }

    // Soft delete by setting isActive to false
    await Product.findByIdAndUpdate(id, { isActive: false });

    return successResponse(null, 'Product deleted successfully');
  } catch (error) {
    console.error('Delete product error:', error);
    return serverErrorResponse('Failed to delete product');
  }
}
