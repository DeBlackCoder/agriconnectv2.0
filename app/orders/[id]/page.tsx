'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar, Footer } from '@/components/layout';
import { Button, LoadingSpinner, Badge } from '@/components/ui';
import { CheckCircle, Package, MapPin, Phone, Mail, User, Calendar, ShoppingBag } from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) throw new Error('Failed to fetch order');
      return res.json();
    },
  });

  const order = data?.data?.order;

  if (isLoading) {
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

  if (error || !order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 pb-16 bg-gray-50">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
            <Link href="/dashboard?tab=orders">
              <Button>View All Orders</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLACED':
        return 'warning';
      case 'CONFIRMED':
      case 'PROCESSING':
        return 'info';
      case 'SHIPPED':
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY':
        return 'primary';
      case 'DELIVERED':
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-4">
              Order #{order.orderNumber}
            </p>
            <Badge variant={getStatusColor(order.status)} size="lg">
              {order.status}
            </Badge>
          </div>

          {/* Seller Contact Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Seller Contact Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-blue-900">
                <User className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">{order.seller.name}</span>
              </div>
              {order.seller.email && (
                <div className="flex items-center gap-3 text-blue-900">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <a href={`mailto:${order.seller.email}`} className="hover:underline">
                    {order.seller.email}
                  </a>
                </div>
              )}
              {order.seller.phone && (
                <div className="flex items-center gap-3 text-blue-900">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <a href={`tel:${order.seller.phone}`} className="hover:underline">
                    {order.seller.phone}
                  </a>
                </div>
              )}
            </div>
            <p className="text-sm text-blue-800 mt-4 bg-blue-100 rounded p-3">
              The seller will contact you shortly to arrange payment and delivery.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-start pb-4 border-b border-gray-200 last:border-0">
                    <div>
                      <div className="font-semibold text-gray-900">{item.productName}</div>
                      <div className="text-sm text-gray-600">
                        {item.quantity} {item.unit} × ₦{item.price.toLocaleString()}
                      </div>
                    </div>
                    <div className="font-semibold text-gray-900">
                      ₦{(item.quantity * item.price).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-green-600">
                    ₦{order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Delivery Information
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Delivery Address</div>
                  <div className="text-gray-900 whitespace-pre-line">
                    {order.deliveryAddress}
                  </div>
                </div>
                {order.notes && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Additional Notes</div>
                    <div className="text-gray-900">{order.notes}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Order Date</div>
                  <div className="text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(order.createdAt)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Payment Status</div>
                  <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard?tab=orders">
              <Button variant="outline" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                View All Orders
              </Button>
            </Link>
            <Link href="/products">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
