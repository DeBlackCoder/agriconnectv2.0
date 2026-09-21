'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar, Footer } from '@/components/layout';
import { Button, LoadingSpinner } from '@/components/ui';
import { MapPin, Phone, User, ShoppingBag, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    unit: string;
    images: string[];
  };
  quantity: number;
  price: number;
  itemTotal: number;
}

interface SellerGroup {
  sellerId: string;
  sellerName: string;
  items: CartItem[];
  subtotal: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cart, setCart] = useState<{ itemsBySeller: SellerGroup[]; totalAmount: number } | null>(null);
  
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cart');
      const data = await res.json();

      if (res.ok && data.data.cart.itemsBySeller.length > 0) {
        setCart(data.data.cart);
      } else {
        toast.error('Your cart is empty');
        router.push('/cart');
      }
    } catch (error) {
      toast.error('Failed to load cart');
      router.push('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deliveryAddress.trim()) {
      toast.error('Please enter delivery address');
      return;
    }

    if (!phone.trim()) {
      toast.error('Please enter phone number');
      return;
    }

    if (!cart) return;

    setSubmitting(true);

    try {
      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryAddress,
          phone,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Orders placed successfully!');
        // Redirect to first order detail page
        const firstOrder = data.data.orders[0];
        router.push(`/orders/${firstOrder._id}`);
      } else {
        toast.error(data.message || 'Failed to place orders');
      }
    } catch (error) {
      toast.error('Failed to place orders');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 pb-16 bg-gray-50 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
        <Footer />
      </>
    );
  }

  if (!cart) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
            {/* Delivery Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contact Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Sellers will contact you on this number
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter your complete delivery address including street, area, city, and state"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special delivery instructions or preferences..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Direct Payment to Sellers</h3>
                    <p className="text-sm text-blue-800">
                      After placing your order, each seller will contact you directly to arrange payment and delivery. 
                      You'll see their contact information on the order confirmation page.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                {/* Orders by Seller */}
                <div className="space-y-4 mb-6">
                  {cart.itemsBySeller.map((sellerGroup) => (
                    <div key={sellerGroup.sellerId} className="border-b border-gray-200 pb-4">
                      <div className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        {sellerGroup.sellerName}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 mb-2">
                        {sellerGroup.items.map((item) => (
                          <div key={item.product._id}>
                            {item.product.name} × {item.quantity}
                          </div>
                        ))}
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        ₦{sellerGroup.subtotal.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Total Items</span>
                    <span className="font-semibold">{cart.itemsBySeller.reduce((sum, g) => sum + g.items.length, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Sellers</span>
                    <span className="font-semibold">{cart.itemsBySeller.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Grand Total</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₦{cart.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 font-semibold"
                >
                  {submitting ? 'Placing Orders...' : 'Place Orders'}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  By placing orders, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
