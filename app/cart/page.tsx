'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, AlertCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button, LoadingSpinner, CartPageSkeleton } from '@/components/ui';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    unit: string;
    stock: number;
    images: string[];
  };
  quantity: number;
  price: number;
  unit: string;
  itemTotal: number;
}

interface SellerGroup {
  sellerId: string;
  sellerName: string;
  items: CartItem[];
  subtotal: number;
}

interface CartData {
  _id: string;
  itemsBySeller: SellerGroup[];
  totalItems: number;
  totalAmount: number;
  updatedAt: string;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const { updateCartCount } = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cart');
      const data = await res.json();

      if (res.ok) {
        setCart(data.data.cart);
      } else {
        toast.error(data.message || 'Failed to load cart');
      }
    } catch (error) {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItems(prev => new Set(prev).add(productId));

    try {
      const res = await fetch(`/api/cart/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const data = await res.json();

      if (res.ok) {
        await fetchCart();
        await updateCartCount();
      } else {
        toast.error(data.message || 'Failed to update quantity');
      }
    } catch (error) {
      toast.error('Failed to update quantity');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const removeItem = async (productId: string) => {
    setUpdatingItems(prev => new Set(prev).add(productId));

    try {
      const res = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Item removed from cart');
        await fetchCart();
        await updateCartCount();
      } else {
        toast.error(data.message || 'Failed to remove item');
      }
    } catch (error) {
      toast.error('Failed to remove item');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your entire cart?')) return;

    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Cart cleared');
        await fetchCart();
        await updateCartCount();
      } else {
        toast.error('Failed to clear cart');
      }
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <CartPageSkeleton />
        <Footer />
      </>
    );
  }

  const isEmpty = !cart || cart.itemsBySeller.length === 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                {!isEmpty && (
                  <p className="text-gray-600 mt-1">
                    {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'} in your cart
                  </p>
                )}
              </div>
              {!isEmpty && (
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Cart
                </button>
              )}
            </div>
          </div>

          {isEmpty ? (
            /* Empty Cart */
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">
                Add some fresh produce from our marketplace to get started!
              </p>
              <Link href="/products">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                  Browse Products
                </Button>
              </Link>
            </div>
          ) : (
            /* Cart with Items */
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items - Grouped by Seller */}
              <div className="lg:col-span-2 space-y-6">
                {cart.itemsBySeller.map((sellerGroup) => (
                  <div key={sellerGroup.sellerId} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Seller Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">
                        Sold by: {sellerGroup.sellerName}
                      </h3>
                    </div>

                    {/* Seller's Products */}
                    <div className="divide-y divide-gray-200">
                      {sellerGroup.items.map((item) => {
                        const isUpdating = updatingItems.has(item.product._id);

                        return (
                          <div key={item._id} className="p-6">
                            <div className="flex gap-4">
                              {/* Product Image */}
                              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                {item.product.images && item.product.images.length > 0 ? (
                                  <Image
                                    src={item.product.images[0]}
                                    alt={item.product.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag className="w-8 h-8 text-gray-300" />
                                  </div>
                                )}
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <Link
                                  href={`/products/${item.product._id}`}
                                  className="font-semibold text-gray-900 hover:text-green-600 block mb-1"
                                >
                                  {item.product.name}
                                </Link>
                                <p className="text-sm text-gray-600 mb-3">
                                  ₦{item.price.toLocaleString()} per {item.unit}
                                </p>

                                {/* Stock Warning */}
                                {item.quantity > item.product.stock && (
                                  <div className="flex items-center gap-2 text-sm text-amber-600 mb-2">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Only {item.product.stock} {item.unit} available</span>
                                  </div>
                                )}

                                {/* Quantity Controls */}
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                      disabled={isUpdating || item.quantity <= 1}
                                      className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-12 text-center font-medium">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                      disabled={isUpdating || item.quantity >= item.product.stock}
                                      className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </div>

                                  <button
                                    onClick={() => removeItem(item.product._id)}
                                    disabled={isUpdating}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Remove
                                  </button>
                                </div>
                              </div>

                              {/* Item Total */}
                              <div className="text-right">
                                <p className="font-bold text-gray-900">
                                  ₦{item.itemTotal.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Seller Subtotal */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Subtotal from {sellerGroup.sellerName}</span>
                        <span className="font-bold text-gray-900">
                          ₦{sellerGroup.subtotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Items ({cart.totalItems})</span>
                      <span>₦{cart.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery</span>
                      <span className="text-green-600">Calculated at checkout</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-green-600">
                        ₦{cart.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 font-semibold mb-3">
                    <Link href="/checkout" className="block w-full">
                      Proceed to Checkout
                    </Link>
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    You're buying from {cart.itemsBySeller.length} {cart.itemsBySeller.length === 1 ? 'seller' : 'sellers'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
