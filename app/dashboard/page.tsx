'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Navbar, Footer } from '@/components/layout';
import { Card, Button, Badge, LoadingSpinner } from '@/components/ui';
import { Package, Heart, TrendingUp, Clock, ShoppingBag, Bell, Plus, Box, BarChart3, Star, ArrowUpRight, Sparkles, Store } from 'lucide-react';

export default function UnifiedDashboard() {
  // Fetch both buyer and seller data
  const { data: buyerOrdersData, isLoading: buyerOrdersLoading } = useQuery({
    queryKey: ['orders', 'buyer'],
    queryFn: async () => {
      const res = await fetch('/api/orders?role=buyer');
      if (!res.ok) return { data: { orders: [], stats: {} } };
      return res.json();
    },
  });

  const { data: sellerOrdersData } = useQuery({
    queryKey: ['orders', 'seller'],
    queryFn: async () => {
      const res = await fetch('/api/orders?role=seller');
      if (!res.ok) return { data: { orders: [], stats: {} } };
      return res.json();
    },
  });

  const { data: productsData } = useQuery({
    queryKey: ['my-products'],
    queryFn: async () => {
      const res = await fetch('/api/products/my-products');
      if (!res.ok) return { data: { products: [] } };
      return res.json();
    },
  });

  const { data: wishlistData } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await fetch('/api/wishlist');
      if (!res.ok) return { data: { wishlist: [] } };
      return res.json();
    },
  });

  const buyerOrders = buyerOrdersData?.data?.orders || [];
  const buyerStats = buyerOrdersData?.data?.stats || {};
  const sellerOrders = sellerOrdersData?.data?.orders || [];
  const sellerStats = sellerOrdersData?.data?.stats || {};
  const products = productsData?.data?.products || [];
  const wishlistItems = wishlistData?.data?.wishlist || [];

  if (buyerOrdersLoading) return <LoadingSpinner fullScreen />;

  // Calculate seller stats
  const totalRevenue = sellerOrders
    .filter((o: any) => o.status === 'DELIVERED' || o.status === 'COMPLETED')
    .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pt-24 sm:pt-24">
        {/* Header - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 sm:mb-6">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">Dashboard</h1>
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
              <p className="text-sm sm:text-base text-slate-600">Welcome back! Here's what's happening</p>
            </div>
            <Link href="/products/create" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium shadow-lg shadow-emerald-600/30 text-sm sm:text-base">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                List Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Clean Bento Grid Layout - Uniform Color Scheme */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-3 sm:gap-4 mb-6 sm:mb-8">
          
          {/* Large Hero Card - Revenue */}
          <div className="col-span-4 sm:col-span-4 lg:col-span-8 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm font-medium opacity-90">Total Revenue</span>
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">₦{(totalRevenue / 1000).toFixed(1)}K</div>
              <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>{sellerStats.total || 0} Sales</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>{buyerStats.total || 0} Purchases</span>
                </div>
              </div>
            </div>
          </div>

          {/* Products Card */}
          <Link href="/inventory" className="col-span-2 sm:col-span-2 lg:col-span-4 group">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border-2 border-emerald-100 hover:border-emerald-600 transition-all h-full shadow-sm hover:shadow-md">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{products.length}</div>
              <div className="text-xs sm:text-sm text-slate-600">Products</div>
              {products.filter((p: any) => p.stock <= 10).length > 0 && (
                <div className="mt-2 pt-2 border-t border-emerald-100">
                  <span className="text-xs text-orange-600 font-medium">
                    {products.filter((p: any) => p.stock <= 10).length} Low Stock
                  </span>
                </div>
              )}
            </div>
          </Link>

          {/* Orders Card */}
          <Link href="/orders" className="col-span-2 sm:col-span-2 lg:col-span-4 group">
            <div className="bg-emerald-500 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white h-full shadow-lg relative overflow-hidden hover:bg-emerald-600 transition-all">
              <div className="absolute -right-4 -bottom-4 w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full"></div>
              <div className="relative z-10">
                <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 mb-2 sm:mb-3 opacity-90" />
                <div className="text-2xl sm:text-3xl font-bold mb-1">{buyerStats.total || 0}</div>
                <div className="text-xs sm:text-sm opacity-90">Orders</div>
                <div className="mt-2 pt-2 border-t border-white/20 text-xs">
                  <span>{buyerStats.inProgress || 0} Active</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Wishlist */}
          <Link href="/profile" className="col-span-2 sm:col-span-2 lg:col-span-4 group">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border-2 border-emerald-100 hover:border-emerald-600 transition-all h-full shadow-sm hover:shadow-md">
              <Heart className="w-6 h-6 sm:w-7 sm:h-7 mb-2 sm:mb-3 text-emerald-600" />
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{wishlistItems.length}</div>
              <div className="text-xs sm:text-sm text-slate-600">Saved Items</div>
            </div>
          </Link>

          {/* Sales Card */}
          <Link href="/orders" className="col-span-2 sm:col-span-2 lg:col-span-4 group">
            <div className="bg-emerald-600 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white h-full shadow-lg hover:shadow-xl transition-all hover:bg-emerald-700">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center mb-2 sm:mb-3">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold mb-1">{sellerStats.total || 0}</div>
              <div className="text-xs sm:text-sm opacity-90">Total Sales</div>
            </div>
          </Link>

          {/* Browse Action */}
          <Link href="/products" className="col-span-2 sm:col-span-2 lg:col-span-4 group">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border-2 border-emerald-100 hover:border-emerald-600 transition-all h-full shadow-sm hover:shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 rounded-full -mr-8 sm:-mr-10 -mt-8 sm:-mt-10"></div>
              <div className="relative z-10">
                <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 mb-2 sm:mb-3 text-emerald-600" />
                <div className="text-base sm:text-lg font-semibold text-slate-900 mb-1">Browse</div>
                <div className="text-xs sm:text-sm text-slate-600">Products</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Activity Feed - Mobile Optimized */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Orders - Mobile Optimized */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">Recent Purchases</h2>
                <p className="text-xs sm:text-sm text-slate-600">Your latest orders</p>
              </div>
              <Link href="/orders">
                <Button className="text-xs sm:text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2">
                  View All
                </Button>
              </Link>
            </div>

            {buyerOrders.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Store className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                </div>
                <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4">No purchases yet</p>
                <Link href="/products">
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white px-5 sm:px-6 py-2 rounded-xl text-xs sm:text-sm">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {buyerOrders.slice(0, 4).map((order: any) => (
                  <Link key={order._id} href={`/orders/${order._id}`}>
                    <div className="group p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition-all">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 sm:mb-2 flex-wrap">
                            <span className="font-mono text-xs text-slate-500">
                              #{order.orderNumber}
                            </span>
                            <Badge 
                              variant={
                                order.status === 'DELIVERED' ? 'success' :
                                order.status === 'CANCELLED' ? 'error' :
                                'warning'
                              }
                              size="sm"
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <div className="text-xs sm:text-sm text-slate-600">
                            {order.items?.length} item(s)
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-sm sm:text-base text-slate-900">
                            ₦{order.totalAmount?.toLocaleString()}
                          </div>
                          <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 group-hover:text-emerald-600 transition-colors ml-auto mt-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Your Products - Mobile Optimized */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">Your Products</h2>
                <p className="text-xs sm:text-sm text-slate-600">Items you're selling</p>
              </div>
              <Link href="/inventory">
                <Button className="text-xs sm:text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2">
                  Manage
                </Button>
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Box className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
                </div>
                <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4">No products listed</p>
                <Link href="/products/create">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 sm:px-6 py-2 rounded-xl text-xs sm:text-sm">
                    List Product
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.slice(0, 4).map((product: any) => (
                  <Link key={product._id} href={`/products/${product._id}`}>
                    <div className="group rounded-xl sm:rounded-2xl border-2 border-slate-200 overflow-hidden hover:border-emerald-600 transition-all bg-white">
                      <div className="aspect-video sm:aspect-square bg-slate-100 overflow-hidden">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <img
                            src={`https://images.unsplash.com/photo-${
                              product.category === 'Vegetables' ? '1540420773-1ae777771ae4' :
                              product.category === 'Fruits' ? '1619566636858-adf3ef46400b' :
                              '1560493676-04071c5f467b'
                            }?w=400&q=80`}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        <div className="font-semibold text-sm sm:text-base text-slate-900 mb-2 line-clamp-1">
                          {product.name}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm sm:text-base text-emerald-600 font-bold">
                            ₦{product.price?.toLocaleString()}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-500">
                            {product.stock} {product.unit}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
