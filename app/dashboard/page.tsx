'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Navbar, Footer } from '@/components/layout';
import { Card, Button, Badge, LoadingSpinner } from '@/components/ui';
import { Package, Heart, TrendingUp, Clock, ShoppingBag, Bell, Plus, Sprout, BarChart3, Star, ArrowUpRight, Sparkles } from 'lucide-react';

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
      
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        {/* Header - Modern asymmetric design */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
                <Sparkles className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-slate-600">Welcome back! Here's what's happening</p>
            </div>
            <Link href="/products/create">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-emerald-600/30">
                <Plus className="w-5 h-5 mr-2" />
                List Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Bento Grid Layout - Asymmetric, Modern - Two Colors Only (Emerald + Slate) */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 mb-8">
          
          {/* Large Hero Card - Revenue */}
          <div className="md:col-span-6 lg:col-span-8 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium opacity-90">Total Revenue</span>
              </div>
              <div className="text-5xl font-bold mb-4">₦{(totalRevenue / 1000).toFixed(1)}K</div>
              <div className="flex items-center gap-4 text-sm">
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

          {/* Products Card - Compact */}
          <Link href="/inventory" className="md:col-span-3 lg:col-span-4 group">
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-emerald-600 transition-all h-full shadow-sm hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-slate-700" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{products.length}</div>
              <div className="text-sm text-slate-600">Products Listed</div>
              {products.filter((p: any) => p.stock <= 10).length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-emerald-600 font-medium">
                    {products.filter((p: any) => p.stock <= 10).length} Low Stock
                  </span>
                </div>
              )}
            </div>
          </Link>

          {/* Orders Card - Medium */}
          <Link href="/orders" className="md:col-span-3 lg:col-span-4 group">
            <div className="bg-slate-900 rounded-3xl p-6 text-white h-full shadow-xl relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="relative z-10">
                <ShoppingBag className="w-8 h-8 mb-3 opacity-90" />
                <div className="text-3xl font-bold mb-1">{buyerStats.total || 0}</div>
                <div className="text-sm opacity-90">Orders Placed</div>
                <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-sm">
                  <span>{buyerStats.inProgress || 0} In Progress</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>

          {/* Wishlist - Compact */}
          <Link href="/profile" className="md:col-span-2 lg:col-span-4 group">
            <div className="bg-emerald-600 rounded-3xl p-6 text-white h-full shadow-lg hover:shadow-xl transition-shadow">
              <Heart className="w-7 h-7 mb-3" />
              <div className="text-3xl font-bold mb-1">{wishlistItems.length}</div>
              <div className="text-sm opacity-90">Saved Items</div>
            </div>
          </Link>

          {/* Sales Card */}
          <Link href="/orders" className="md:col-span-2 lg:col-span-4 group">
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-emerald-600 transition-all h-full shadow-sm">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{sellerStats.total || 0}</div>
              <div className="text-sm text-slate-600">Total Sales</div>
            </div>
          </Link>

          {/* Quick Action - Browse */}
          <Link href="/products" className="md:col-span-2 lg:col-span-4 group">
            <div className="bg-slate-900 rounded-3xl p-6 text-white h-full shadow-lg hover:shadow-xl transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <ShoppingBag className="w-7 h-7 mb-3" />
                <div className="text-lg font-semibold mb-1">Browse</div>
                <div className="text-sm opacity-90">Fresh Products</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Activity Feed - Modern Timeline Style */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders - Card Style */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Recent Purchases</h2>
                <p className="text-sm text-slate-600">Your latest orders</p>
              </div>
              <Link href="/orders">
                <Button className="text-sm text-emerald-600 hover:bg-emerald-50 rounded-xl px-4 py-2">
                  View All
                </Button>
              </Link>
            </div>

            {buyerOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 mb-4">No purchases yet</p>
                <Link href="/products">
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-xl text-sm">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {buyerOrders.slice(0, 4).map((order: any) => (
                  <Link key={order._id} href={`/orders/${order._id}`}>
                    <div className="group p-4 rounded-2xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
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
                          <div className="text-sm text-slate-600">
                            {order.items?.length} item(s)
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900">
                            ₦{order.totalAmount?.toLocaleString()}
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors ml-auto" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Your Products - Modern Grid */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Your Products</h2>
                <p className="text-sm text-slate-600">Items you're selling</p>
              </div>
              <Link href="/inventory">
                <Button className="text-sm text-emerald-600 hover:bg-emerald-50 rounded-xl px-4 py-2">
                  Manage
                </Button>
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Sprout className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-slate-600 mb-4">No products listed</p>
                <Link href="/products/create">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-sm">
                    List Product
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {products.slice(0, 4).map((product: any) => (
                  <div key={product._id} className="group relative rounded-2xl border border-slate-200 overflow-hidden hover:border-emerald-600 transition-all">
                    <div className="aspect-square bg-slate-100 overflow-hidden">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <img
                          src={`https://images.unsplash.com/photo-${
                            product.category === 'Vegetables' ? '1540420773-1ae777771ae4' :
                            product.category === 'Fruits' ? '1619566636858-adf3ef46400b' :
                            '1560493676-04071c5f467b'
                          }?w=200&q=80`}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                    </div>
                    <div className="p-3">
                      <div className="font-semibold text-sm text-slate-900 line-clamp-1 mb-1">
                        {product.name}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-emerald-600 font-bold">
                          ₦{product.price?.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          {product.stock} {product.unit}s
                        </div>
                      </div>
                    </div>
                  </div>
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
