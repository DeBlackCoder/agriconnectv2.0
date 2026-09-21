'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Navbar, Footer } from '@/components/layout';
import { Card, Button, Badge, LoadingSpinner, Input } from '@/components/ui';
import { Package, Search, Filter } from 'lucide-react';

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['orders', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await fetch(`/api/orders?${params}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
  });

  const orders = data?.data?.orders || [];
  const stats = data?.data?.stats || {};

  const filteredOrders = search
    ? orders.filter((o: any) => o.orderNumber?.toLowerCase().includes(search.toLowerCase()))
    : orders;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-4xl font-bold gradient-text mb-2">My Orders</h1>
        <p className="text-muted mb-8">Track and manage all your orders</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card variant="neural" className="p-4">
            <div className="text-2xl font-bold gradient-text">{stats.total || 0}</div>
            <div className="text-sm text-muted">Total Orders</div>
          </Card>
          <Card variant="neural" className="p-4">
            <div className="text-2xl font-bold text-yellow-400">{stats.pending || 0}</div>
            <div className="text-sm text-muted">Pending</div>
          </Card>
          <Card variant="neural" className="p-4">
            <div className="text-2xl font-bold text-blue-400">{stats.inProgress || 0}</div>
            <div className="text-sm text-muted">In Progress</div>
          </Card>
          <Card variant="neural" className="p-4">
            <div className="text-2xl font-bold text-green-400">{stats.delivered || 0}</div>
            <div className="text-sm text-muted">Delivered</div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search by order number..."
              icon={<Search className="w-5 h-5" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['', 'PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? 'bg-slate-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {status || 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <LoadingSpinner fullScreen />
        ) : filteredOrders.length === 0 ? (
          <Card variant="glass" className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted" />
            <p className="text-muted text-lg mb-4">No orders found</p>
            <Link href="/products">
              <Button variant="neural">Start Shopping</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order: any) => (
              <Link key={order._id} href={`/orders/${order._id}`}>
                <Card variant="neural" hoverable className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-mono font-bold">#{order.orderNumber}</span>
                        <Badge 
                          variant={
                            order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'success' :
                            order.status === 'CANCELLED' ? 'error' :
                            order.status === 'SHIPPED' || order.status === 'IN_TRANSIT' ? 'info' :
                            'warning'
                          }
                        >
                          {order.status}
                        </Badge>
                        {order.payment?.status === 'COMPLETED' && (
                          <Badge variant="success" size="sm">Paid</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-muted">
                          {order.items?.length} item(s) • Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        {order.items && order.items.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {order.items.slice(0, 3).map((item: any, idx: number) => (
                              <span key={idx} className="text-sm text-muted">
                                {item.productName} ({item.quantity} {item.unit}s)
                              </span>
                            ))}
                            {order.items.length > 3 && (
                              <span className="text-sm text-muted">+{order.items.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-3xl font-bold gradient-text mb-2">
                        ₦{order.totalAmount?.toLocaleString()}
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
