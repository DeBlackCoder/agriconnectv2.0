'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Navbar, Footer } from '@/components/layout';
import { Card, Button, Badge, LoadingSpinner } from '@/components/ui';
import { Package, Heart, TrendingUp, Clock, ShoppingBag, Bell } from 'lucide-react';

export default function BuyerDashboard() {
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', 'buyer'],
    queryFn: async () => {
      const res = await fetch('/api/orders?role=buyer');
      if (!res.ok) throw new Error('Failed to fetch orders');
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

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications?unreadOnly=true');
      if (!res.ok) return { data: { notifications: [], unreadCount: 0 } };
      return res.json();
    },
  });

  const orders = ordersData?.data?.orders || [];
  const stats = ordersData?.data?.stats || {};
  const wishlistItems = wishlistData?.data?.wishlist || [];
  const unreadCount = notificationsData?.data?.unreadCount || 0;

  if (ordersLoading) return <LoadingSpinner fullScreen />;

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Buyer Dashboard</h1>
            <p className="text-muted">Welcome back! Here's your overview</p>
          </div>
          <Link href="/notifications">
            <Button variant="outline" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: 'Total Orders', 
              value: stats.total || 0, 
              icon: Package,
              color: 'text-blue-400',
              bgColor: 'from-blue-500/20 to-cyan-500/20'
            },
            { 
              label: 'In Progress', 
              value: stats.inProgress || 0, 
              icon: Clock,
              color: 'text-yellow-400',
              bgColor: 'from-yellow-500/20 to-orange-500/20'
            },
            { 
              label: 'Delivered', 
              value: stats.delivered || 0, 
              icon: TrendingUp,
              color: 'text-green-400',
              bgColor: 'from-green-500/20 to-emerald-500/20'
            },
            { 
              label: 'Wishlist Items', 
              value: wishlistItems.length, 
              icon: Heart,
              color: 'text-pink-400',
              bgColor: 'from-pink-500/20 to-purple-500/20'
            },
          ].map((stat, i) => (
            <Card key={i} variant="neural" className="p-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.bgColor} flex items-center justify-center mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-muted">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="/products">
            <Card variant="glass" hoverable className="p-6 text-center">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-primary-neural" />
              <h3 className="font-bold text-lg mb-2">Browse Products</h3>
              <p className="text-sm text-muted">Explore fresh produce from farmers</p>
            </Card>
          </Link>
          <Link href="/orders">
            <Card variant="glass" hoverable className="p-6 text-center">
              <Package className="w-12 h-12 mx-auto mb-3 text-primary-neural" />
              <h3 className="font-bold text-lg mb-2">My Orders</h3>
              <p className="text-sm text-muted">Track and manage your orders</p>
            </Card>
          </Link>
          <Link href="/profile">
            <Card variant="glass" hoverable className="p-6 text-center">
              <Heart className="w-12 h-12 mx-auto mb-3 text-primary-neural" />
              <h3 className="font-bold text-lg mb-2">Wishlist</h3>
              <p className="text-sm text-muted">View your saved products</p>
            </Card>
          </Link>
        </div>

        {/* Recent Orders */}
        <Card variant="glass-elevated" className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Orders</h2>
            <Link href="/orders">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted" />
              <p className="text-muted text-lg mb-4">No orders yet</p>
              <Link href="/products">
                <Button variant="neural">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order: any) => (
                <Link key={order._id} href={`/orders/${order._id}`}>
                  <Card variant="neural" hoverable className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm text-muted">
                            #{order.orderNumber}
                          </span>
                          <Badge 
                            variant={
                              order.status === 'DELIVERED' ? 'success' :
                              order.status === 'CANCELLED' ? 'error' :
                              order.status === 'SHIPPED' ? 'info' :
                              'warning'
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted">
                          {order.items?.length} item(s) • {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold gradient-text">
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
      </div>

      <Footer />
    </div>
  );
}
