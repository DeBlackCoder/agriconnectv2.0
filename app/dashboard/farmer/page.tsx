'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Navbar, Footer } from '@/components/layout';
import { Card, Button, Badge, LoadingSpinner } from '@/components/ui';
import { Package, DollarSign, TrendingUp, ShoppingBag, Plus, BarChart3, Star } from 'lucide-react';

export default function FarmerDashboard() {
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['my-products'],
    queryFn: async () => {
      const res = await fetch('/api/products/my-products');
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  const { data: ordersData } = useQuery({
    queryKey: ['orders', 'seller'],
    queryFn: async () => {
      const res = await fetch('/api/orders?role=seller');
      if (!res.ok) return { data: { orders: [], stats: {} } };
      return res.json();
    },
  });

  const products = productsData?.data?.products || [];
  const orders = ordersData?.data?.orders || [];
  const orderStats = ordersData?.data?.stats || {};

  if (productsLoading) return <LoadingSpinner fullScreen />;

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter((p: any) => p.stock > 0).length;
  const totalRevenue = orders
    .filter((o: any) => o.status === 'DELIVERED' || o.status === 'COMPLETED')
    .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
  const averageRating = products.reduce((sum: number, p: any) => sum + (p.rating?.average || 0), 0) / totalProducts || 0;

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Farmer Dashboard</h1>
            <p className="text-muted">Manage your products and orders</p>
          </div>
          <Link href="/products/create">
            <Button variant="neural">
              <Plus className="w-5 h-5 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: 'Total Products', 
              value: totalProducts, 
              icon: Package,
              color: 'text-blue-400',
              bgColor: 'from-blue-500/20 to-cyan-500/20',
              subtitle: `${activeProducts} active`
            },
            { 
              label: 'Total Orders', 
              value: orderStats.total || 0, 
              icon: ShoppingBag,
              color: 'text-purple-400',
              bgColor: 'from-purple-500/20 to-pink-500/20',
              subtitle: `${orderStats.pending || 0} pending`
            },
            { 
              label: 'Total Revenue', 
              value: `₦${(totalRevenue / 1000).toFixed(1)}K`, 
              icon: DollarSign,
              color: 'text-green-400',
              bgColor: 'from-green-500/20 to-emerald-500/20',
              subtitle: 'All time'
            },
            { 
              label: 'Average Rating', 
              value: averageRating.toFixed(1), 
              icon: Star,
              color: 'text-yellow-400',
              bgColor: 'from-yellow-500/20 to-orange-500/20',
              subtitle: `${products.reduce((sum: number, p: any) => sum + (p.rating?.count || 0), 0)} reviews`
            },
          ].map((stat, i) => (
            <Card key={i} variant="neural" className="p-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.bgColor} flex items-center justify-center mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-muted">{stat.label}</div>
              {stat.subtitle && (
                <div className="text-xs text-muted mt-1">{stat.subtitle}</div>
              )}
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Link href="/products/create">
            <Card variant="glass" hoverable className="p-6 text-center">
              <Plus className="w-12 h-12 mx-auto mb-3 text-primary-neural" />
              <h3 className="font-bold text-lg">Add Product</h3>
            </Card>
          </Link>
          <Link href="/inventory">
            <Card variant="glass" hoverable className="p-6 text-center">
              <Package className="w-12 h-12 mx-auto mb-3 text-primary-neural" />
              <h3 className="font-bold text-lg">Inventory</h3>
            </Card>
          </Link>
          <Link href="/orders">
            <Card variant="glass" hoverable className="p-6 text-center">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-primary-neural" />
              <h3 className="font-bold text-lg">Orders</h3>
            </Card>
          </Link>
          <Link href="/pricing">
            <Card variant="glass" hoverable className="p-6 text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-primary-neural" />
              <h3 className="font-bold text-lg">Pricing</h3>
            </Card>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card variant="glass-elevated" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Recent Orders</h2>
              <Link href="/orders">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-muted" />
                <p className="text-muted">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order: any) => (
                  <Link key={order._id} href={`/orders/${order._id}`}>
                    <Card variant="neural" hoverable className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-mono text-sm text-muted mb-1">
                            #{order.orderNumber}
                          </div>
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
                        <div className="text-right">
                          <div className="font-bold gradient-text">
                            ₦{order.totalAmount?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Product Inventory */}
          <Card variant="glass-elevated" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Product Inventory</h2>
              <Link href="/inventory">
                <Button variant="outline" size="sm">Manage</Button>
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 mx-auto mb-3 text-muted" />
                <p className="text-muted mb-4">No products listed</p>
                <Link href="/products/create">
                  <Button variant="neural" size="sm">Add Your First Product</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {products.slice(0, 5).map((product: any) => (
                  <Card key={product._id} variant="neural" className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center overflow-hidden">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <img
                            src={`https://images.unsplash.com/photo-${
                              product.category === 'Vegetables' ? '1540420773-1ae777771ae4' :
                              product.category === 'Fruits' ? '1619566636858-adf3ef46400b' :
                              '1560493676-04071c5f467b'
                            }?w=100&q=80`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold line-clamp-1">{product.name}</div>
                        <div className="text-sm text-muted">Stock: {product.stock} {product.unit}s</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">₦{product.price?.toLocaleString()}</div>
                        {product.stock <= 10 && (
                          <Badge variant="warning" size="sm">Low Stock</Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
