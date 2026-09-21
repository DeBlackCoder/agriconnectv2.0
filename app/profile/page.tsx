'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar, Footer } from '@/components/layout';
import { Card, Button, Input, Alert, Badge, LoadingSpinner, ConfirmModal } from '@/components/ui';
import { User, Mail, Phone, MapPin, Edit2, Save, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: { state: '', lga: '', address: '' },
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch('/api/users/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
  });

  // Set form data after query success
  const userData = data?.data?.user;
  if (userData && formData.name === '') {
    setFormData({
      name: userData.name || '',
      phone: userData.phone || '',
      location: userData.location || { state: '', lga: '', address: '' },
    });
  }

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update profile');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: any) => {
      setError(err.message);
      setSuccess('');
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/users/profile', {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete account');
      }
      return res.json();
    },
    onSuccess: () => {
      // Sign out and redirect to homepage
      fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    },
    onError: (err: any) => {
      setError(err.message);
      setSuccess('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({ userUpdate: formData });
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  const user = data?.data?.user;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">My Profile</h1>
            <p className="text-muted">Manage your account information</p>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit2 className="w-5 h-5 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        {success && <Alert variant="success" className="mb-6">{success}</Alert>}
        {error && <Alert variant="error" className="mb-6">{error}</Alert>}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            <Card variant="neural" className="p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-1">{user?.name}</h2>
              <Badge variant="primary" className="mb-3">
                {user?.role}
              </Badge>
              <p className="text-sm text-muted">{user?.email}</p>
            </Card>

            <Card variant="glass" className="p-6">
              <h3 className="font-bold mb-4">Account Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Member Since</span>
                  <span className="font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Verified</span>
                  <Badge variant={user?.isActive ? 'success' : 'warning'} size="sm">
                    {user?.isActive ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card variant="glass-elevated" className="p-6 mb-6">
                <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
                
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    icon={<User className="w-5 h-5" />}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    required
                  />

                  <Input
                    type="email"
                    label="Email"
                    icon={<Mail className="w-5 h-5" />}
                    value={user?.email || ''}
                    disabled
                    helperText="Email cannot be changed"
                  />

                  <Input
                    type="tel"
                    label="Phone Number"
                    icon={<Phone className="w-5 h-5" />}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </Card>

              <Card variant="glass-elevated" className="p-6 mb-6">
                <h2 className="text-2xl font-bold mb-6">Location</h2>
                
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="State"
                      icon={<MapPin className="w-5 h-5" />}
                      value={formData.location.state}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        location: { ...formData.location, state: e.target.value }
                      })}
                      disabled={!isEditing}
                    />
                    <Input
                      label="Local Government Area"
                      value={formData.location.lga}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        location: { ...formData.location, lga: e.target.value }
                      })}
                      disabled={!isEditing}
                    />
                  </div>
                  <Input
                    label="Address"
                    value={formData.location.address}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      location: { ...formData.location, address: e.target.value }
                    })}
                    disabled={!isEditing}
                  />
                </div>
              </Card>

              {isEditing && (
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={() => {
                      setIsEditing(false);
                      setError('');
                      // Reset form data
                      const currentUser = data?.data?.user;
                      setFormData({
                        name: currentUser?.name || '',
                        phone: currentUser?.phone || '',
                        location: currentUser?.location || { state: '', lga: '', address: '' },
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="neural"
                    fullWidth
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>

            {/* Danger Zone */}
            <Card variant="glass-elevated" className="p-6 border-2 border-red-500/20">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400 mt-0.5" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-red-400 mb-1">Danger Zone</h2>
                  <p className="text-sm text-muted">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                </div>
              </div>
              <Button
                variant="error"
                onClick={() => setShowDeleteModal(true)}
                className="w-full"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Delete Account
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => deleteAccount.mutate()}
        title="Delete Account"
        message={`Are you sure you want to delete your account? All your data including products, orders, and personal information will be permanently removed. This action cannot be undone.`}
        confirmText="Yes, Delete My Account"
        cancelText="Cancel"
        variant="danger"
        icon="delete"
      />

      <Footer />
    </div>
  );
}
