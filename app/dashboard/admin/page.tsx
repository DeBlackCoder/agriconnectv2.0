'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout';
import { Card, Button, Badge, LoadingSpinner, Input } from '@/components/ui';
import { Users, ShoppingBag, DollarSign, TrendingUp, Search, Shield, UserCheck, UserX } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      params.append('limit', '50');

      const res = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!res.ok) {
        if (res.status === 403) {
          router.push('/dashboard');
          throw new Error('Access denied');
        }
        throw new Error('Failed to fetch users');
      }
      
      return res.json();
    },
  });

  const users = usersData?.data?.users || [];
  const stats = usersData?.data?.stats || {};

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error('Failed to update user');

      // Refresh the users list
      window.location.reload();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user role');
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!res.ok) throw new Error('Failed to update user');

      // Refresh the users list
      window.location.reload();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user status');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary-neural" />
            <h1 className="text-4xl font-bold gradient-text">Admin Dashboard</h1>
          </div>
          <p className="text-xl text-muted">Manage users and platform settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="neural" className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted text-sm mb-1">Total Users</p>
                <p className="text-3xl font-bold gradient-text">{stats.total || 0}</p>
              </div>
              <Users className="w-10 h-10 text-primary-neural opacity-50" />
            </div>
          </Card>

          <Card variant="neural" className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted text-sm mb-1">Active Users</p>
                <p className="text-3xl font-bold text-emerald-400">{stats.active || 0}</p>
              </div>
              <UserCheck className="w-10 h-10 text-emerald-400 opacity-50" />
            </div>
          </Card>

          <Card variant="neural" className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted text-sm mb-1">Admins</p>
                <p className="text-3xl font-bold text-purple-400">{stats.admins || 0}</p>
              </div>
              <Shield className="w-10 h-10 text-purple-400 opacity-50" />
            </div>
          </Card>

          <Card variant="neural" className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted text-sm mb-1">Regular Users</p>
                <p className="text-3xl font-bold text-blue-400">{stats.users || 0}</p>
              </div>
              <Users className="w-10 h-10 text-blue-400 opacity-50" />
            </div>
          </Card>
        </div>

        {/* User Management */}
        <Card variant="neural" className="p-6">
          <h2 className="text-2xl font-bold mb-6">User Management</h2>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by name or email..."
                  icon={<Search className="w-5 h-5" />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setRoleFilter(roleFilter === '' ? '' : '')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  roleFilter === ''
                    ? 'bg-primary-neural text-white'
                    : 'glass hover:bg-white/10'
                }`}
              >
                All Users
              </button>
              <button
                onClick={() => setRoleFilter(roleFilter === 'USER' ? '' : 'USER')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  roleFilter === 'USER'
                    ? 'bg-primary-neural text-white'
                    : 'glass hover:bg-white/10'
                }`}
              >
                Regular Users
              </button>
              <button
                onClick={() => setRoleFilter(roleFilter === 'ADMIN' ? '' : 'ADMIN')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  roleFilter === 'ADMIN'
                    ? 'bg-primary-neural text-white'
                    : 'glass hover:bg-white/10'
                }`}
              >
                Admins
              </button>
            </div>
          </div>

          {/* Users Table */}
          {usersLoading ? (
            <LoadingSpinner />
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-muted font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Role</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr key={user._id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4 text-muted">{user.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'info'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={user.isActive ? 'success' : 'error'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {user.role === 'USER' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRoleChange(user._id, 'ADMIN')}
                            >
                              Make Admin
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRoleChange(user._id, 'USER')}
                            >
                              Remove Admin
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant={user.isActive ? 'ghost' : 'primary'}
                            onClick={() => handleToggleActive(user._id, user.isActive)}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
