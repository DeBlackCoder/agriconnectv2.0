import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { requireAuth, isErrorResponse } from '@/lib/middleware';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response';

interface RouteParams {
  params: Promise<{ productId: string }>;
}

// PATCH /api/cart/[productId] - Update quantity
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();
    
    // Ensure Product model is registered
    Product;

    const { productId } = await params;
    const body = await request.json();
    const { quantity } = body;

    if (quantity < 1) {
      return errorResponse('Quantity must be at least 1', 400);
    }

    // Find product to check stock
    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse('Product not found', 404);
    }

    if (quantity > product.stock) {
      return errorResponse(`Only ${product.stock} ${product.unit} available`, 400);
    }

    if (quantity < product.minOrder) {
      return errorResponse(`Minimum order is ${product.minOrder} ${product.unit}`, 400);
    }

    // Update cart
    const cart = await Cart.findOne({ user: user.userId });
    if (!cart) {
      return errorResponse('Cart not found', 404);
    }

    const itemIndex = cart.items.findIndex(
      (item: any) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return errorResponse('Item not in cart', 404);
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price; // Update to latest price
    await cart.save();

    return successResponse(
      { 
        cartItemCount: cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0) 
      },
      'Cart updated'
    );
  } catch (error) {
    console.error('Update cart error:', error);
    return serverErrorResponse('Failed to update cart');
  }
}

// DELETE /api/cart/[productId] - Remove item from cart
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    const { productId } = await params;

    const cart = await Cart.findOne({ user: user.userId });
    if (!cart) {
      return errorResponse('Cart not found', 404);
    }

    cart.items = cart.items.filter(
      (item: any) => item.product.toString() !== productId
    );
    await cart.save();

    return successResponse(
      { 
        cartItemCount: cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0) 
      },
      'Item removed from cart'
    );
  } catch (error) {
    console.error('Remove from cart error:', error);
    return serverErrorResponse('Failed to remove from cart');
  }
}
