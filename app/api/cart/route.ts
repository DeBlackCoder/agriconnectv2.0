import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import User from '@/models/User';
import { requireAuth, isErrorResponse } from '@/lib/middleware';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response';

// GET /api/cart - Get user's cart
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();
    
    // Ensure User and Product models are registered
    User;
    Product;

    // Find or create cart
    let cart = await Cart.findOne({ user: user.userId })
      .populate({
        path: 'items.product',
        select: 'name price unit stock images seller isActive',
        populate: {
          path: 'seller',
          select: 'name email',
        },
      })
      .lean();

    if (!cart) {
      // Create empty cart if doesn't exist
      cart = await Cart.create({
        user: user.userId,
        items: [],
      });
    }

    // Filter out inactive products and check stock
    const validItems = cart.items.filter((item: any) => {
      const product = item.product;
      return product && product.isActive && product.stock > 0;
    });

    // Calculate totals grouped by seller
    const itemsBySeller: Record<string, any> = {};
    let totalItems = 0;
    let totalAmount = 0;

    validItems.forEach((item: any) => {
      const product = item.product;
      const sellerId = product.seller._id.toString();
      const sellerName = product.seller.name;

      if (!itemsBySeller[sellerId]) {
        itemsBySeller[sellerId] = {
          sellerId,
          sellerName,
          items: [],
          subtotal: 0,
        };
      }

      const itemTotal = item.quantity * item.price;
      itemsBySeller[sellerId].items.push({
        _id: item._id,
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          unit: product.unit,
          stock: product.stock,
          images: product.images,
        },
        quantity: item.quantity,
        price: item.price,
        unit: item.unit,
        itemTotal,
      });

      itemsBySeller[sellerId].subtotal += itemTotal;
      totalAmount += itemTotal;
      totalItems += item.quantity;
    });

    return successResponse({
      cart: {
        _id: cart._id,
        itemsBySeller: Object.values(itemsBySeller),
        totalItems,
        totalAmount,
        updatedAt: cart.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return serverErrorResponse('Failed to fetch cart');
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();
    
    // Ensure models are registered
    User;
    Product;

    const body = await request.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    if (quantity < 1) {
      return errorResponse('Quantity must be at least 1', 400);
    }

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse('Product not found', 404);
    }

    if (!product.isActive) {
      return errorResponse('Product is no longer available', 400);
    }

    if (product.stock < quantity) {
      return errorResponse(`Only ${product.stock} ${product.unit} available`, 400);
    }

    if (quantity < product.minOrder) {
      return errorResponse(`Minimum order is ${product.minOrder} ${product.unit}`, 400);
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: user.userId });
    if (!cart) {
      cart = await Cart.create({
        user: user.userId,
        items: [],
      });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (newQuantity > product.stock) {
        return errorResponse(`Cannot add more. Only ${product.stock} ${product.unit} available`, 400);
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = product.price; // Update to latest price
    } else {
      // Add new item
      cart.items.push({
        product: product._id,
        quantity,
        price: product.price,
        unit: product.unit,
      });
    }

    await cart.save();

    return successResponse(
      { 
        cartItemCount: cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0) 
      },
      'Product added to cart'
    );
  } catch (error) {
    console.error('Add to cart error:', error);
    return serverErrorResponse('Failed to add to cart');
  }
}

// DELETE /api/cart - Clear entire cart
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;
    const user = authResult;

    await connectDB();

    await Cart.findOneAndUpdate(
      { user: user.userId },
      { items: [] }
    );

    return successResponse(null, 'Cart cleared');
  } catch (error) {
    console.error('Clear cart error:', error);
    return serverErrorResponse('Failed to clear cart');
  }
}
