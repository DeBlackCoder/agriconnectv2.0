'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Navbar, Footer } from '@/components/layout';
import { Card, Button, Input, Alert, ImageUpload } from '@/components/ui';
import { Loader2, Leaf, CheckCircle, AlertCircle } from 'lucide-react';

export default function CreateProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Vegetables',
    price: '',
    unit: 'kg',
    stock: '',
    minOrder: '1',
    isOrganic: false,
    isCertified: false,
    location: '', // Single string field
  });
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const createProduct = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create product');
      }
      return res.json();
    },
    onSuccess: (response) => {
      // Response structure: { success: true, data: product, message: '...' }
      const product = response?.data;
      setSuccess('Product created successfully! Redirecting...');
      setTimeout(() => {
        if (product?._id) {
          router.push(`/products/${product._id}`);
        } else {
          router.push('/inventory');
        }
      }, 1500);
    },
    onError: (err: any) => {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!formData.description.trim() || formData.description.length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Valid price is required');
      return;
    }
    if (!formData.stock || parseFloat(formData.stock) < 0) {
      setError('Valid stock quantity is required');
      return;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return;
    }
    if (images.length === 0) {
      setError('At least one product image is required');
      return;
    }

    createProduct.mutate({
      ...formData,
      price: parseFloat(formData.price),
      stock: parseFloat(formData.stock),
      minOrder: parseFloat(formData.minOrder),
      images,
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-4xl font-bold gradient-text mb-2">Add New Product</h1>
        <p className="text-muted mb-8">List your product on AgriConnect marketplace</p>

        {error && <Alert variant="error" className="mb-6">{error}</Alert>}
        {success && <Alert variant="success" className="mb-6">{success}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card variant="glass-elevated" className="p-6">
            <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
            
            <div className="space-y-4">
              <Input
                label="Product Name"
                placeholder="e.g., Fresh Tomatoes"
                value={formData.name ?? ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                minLength={3}
                maxLength={100}
              />

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description<span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary-neural outline-none transition-all"
                  rows={4}
                  placeholder="Describe your product..."
                  value={formData.description ?? ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  minLength={10}
                  maxLength={1000}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary-neural outline-none transition-all"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains">Grains</option>
                    <option value="Tubers">Tubers</option>
                    <option value="Legumes">Legumes</option>
                    <option value="Spices">Spices</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Unit</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary-neural outline-none transition-all"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    required
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="g">Gram (g)</option>
                    <option value="ton">Ton</option>
                    <option value="bag">Bag</option>
                    <option value="piece">Piece</option>
                    <option value="bunch">Bunch</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Pricing & Inventory */}
          <Card variant="glass-elevated" className="p-6">
            <h2 className="text-2xl font-bold mb-6">Pricing & Inventory</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              <Input
                type="number"
                label="Price per Unit (₦)"
                placeholder="0.00"
                step="0.01"
                min={0}
                value={formData.price ?? ''}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
              <Input
                type="number"
                label="Available Stock"
                placeholder="0"
                min={0}
                value={formData.stock ?? ''}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
              <Input
                type="number"
                label="Minimum Order"
                placeholder="1"
                min={1}
                value={formData.minOrder ?? ''}
                onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                required
              />
            </div>
          </Card>

          {/* Location */}
          <Card variant="glass-elevated" className="p-6">
            <h2 className="text-2xl font-bold mb-6">Location</h2>
            
            <Input
              label="Location"
              placeholder="e.g., Ikeja, Lagos State"
              value={formData.location ?? ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              helperText="Enter your city, state, or full address"
              required
              minLength={3}
            />
          </Card>

          {/* Images */}
          <Card variant="glass-elevated" className="p-6">
            <h2 className="text-2xl font-bold mb-4">Product Images</h2>
            <p className="text-sm text-muted mb-6">
              Upload up to 5 high-quality images. First image will be the main product photo.
            </p>
            
            <ImageUpload
              images={images}
              onChange={setImages}
              maxImages={5}
              maxSizeMB={5}
            />
          </Card>

          {/* Certifications */}
          <Card variant="glass-elevated" className="p-6">
            <h2 className="text-2xl font-bold mb-6">Certifications</h2>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isOrganic}
                  onChange={(e) => setFormData({ ...formData, isOrganic: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20"
                />
                <Leaf className="w-5 h-5 text-green-500" />
                <span>This product is organic</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isCertified}
                  onChange={(e) => setFormData({ ...formData, isCertified: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20"
                />
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span>I have quality certification</span>
              </label>
            </div>
          </Card>

          {/* Submit */}
          <div className="flex gap-4 sticky bottom-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200 shadow-lg">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => router.back()}
              disabled={createProduct.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="neural"
              fullWidth
              disabled={createProduct.isPending || uploadingImages || images.length === 0}
            >
              {createProduct.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Product...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Create Product
                </>
              )}
            </Button>
          </div>

          {/* Form Helper */}
          <div className="text-center text-sm text-slate-500">
            <p>By creating a product, you agree to our terms of service and seller policies.</p>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
