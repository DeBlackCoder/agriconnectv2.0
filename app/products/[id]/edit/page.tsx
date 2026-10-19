'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Navbar, Footer } from '@/components/layout';
import { Button, Input, LoadingSpinner } from '@/components/ui';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Grains',
  'Legumes',
  'Tubers',
  'Livestock',
  'Poultry',
  'Dairy',
  'Others'
];

const UNITS = ['kg', 'bags', 'pieces', 'liters', 'crates', 'bunches'];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const productId = params.id as string;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    unit: '',
    location: '',
    minOrder: '',
    images: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch product data
  const { data: productData, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const res = await fetch(`/api/products/${productId}`);
      if (!res.ok) throw new Error('Failed to fetch product');
      return res.json();
    },
  });

  // Update form when product data loads
  useEffect(() => {
    if (productData?.data) {
      const product = productData.data;
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || '',
        unit: product.unit || '',
        location: product.location || '',
        minOrder: product.minOrder?.toString() || '1',
        images: product.images || [],
      });
    }
  }, [productData]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          price: parseFloat(data.price),
          stock: parseInt(data.stock),
          minOrder: parseInt(data.minOrder),
        }),
      });
      
      // Try to parse response
      let errorData;
      try {
        errorData = await res.json();
      } catch (e) {
        throw new Error(`Server error (${res.status}): Unable to parse response`);
      }
      
      if (!res.ok) {
        // Extract detailed error message and field-specific errors
        const errorMessage = errorData.error || errorData.message || `Failed to update product (Status: ${res.status})`;
        
        // If there are field-specific errors, set them
        if (errorData.errors && typeof errorData.errors === 'object') {
          setErrors(errorData.errors);
        }
        
        throw new Error(errorMessage);
      }
      
      return errorData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
      
      // Small delay to show success message
      setTimeout(() => {
        router.push(`/products/${productId}`);
      }, 1000);
    },
    onError: (error: any) => {
      // Scroll to first error
      const firstErrorField = document.querySelector('[class*="border-red"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'Valid stock is required';
    if (!formData.unit) newErrors.unit = 'Unit is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    updateMutation.mutate(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/products/${productId}`} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Product</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Edit Product</h1>
          <p className="text-slate-600 mt-2">Update your product information</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="space-y-6">
            
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Product Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Fresh Tomatoes"
                error={errors.name}
              />
            </div>

            {/* Category & Unit */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.category ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white`}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Unit *
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.unit ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white`}
                >
                  <option value="">Select unit</option>
                  {UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
                {errors.unit && (
                  <p className="mt-1 text-sm text-red-600">{errors.unit}</p>
                )}
              </div>
            </div>

            {/* Price & Stock */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price (₦) *
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  error={errors.price}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Stock Quantity *
                </label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleChange('stock', e.target.value)}
                  placeholder="0"
                  min="0"
                  error={errors.stock}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Location *
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g., Ikeja, Lagos State"
                error={errors.location}
              />
              <p className="mt-1 text-xs text-slate-500">Enter city, state, or any location information</p>
            </div>

            {/* Minimum Order */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Minimum Order Quantity
              </label>
              <Input
                type="number"
                value={formData.minOrder}
                onChange={(e) => handleChange('minOrder', e.target.value)}
                placeholder="1"
                min="1"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe your product..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </Button>
              
              <Link href={`/products/${productId}`} className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-2 border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-xl font-medium"
                >
                  Cancel
                </Button>
              </Link>
            </div>

            {/* Error Message - Only show general errors, field errors show on inputs */}
            {updateMutation.isError && Object.keys(errors).length === 0 && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-red-800 mb-1">Failed to Update Product</h4>
                    <p className="text-sm text-red-700">
                      {updateMutation.error?.message || 'An unexpected error occurred. Please try again.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Field validation errors summary */}
            {Object.keys(errors).length > 0 && (
              <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-orange-800 mb-2">Please fix the following errors:</h4>
                    <ul className="text-sm text-orange-700 space-y-1 list-disc list-inside">
                      {Object.entries(errors).map(([field, error]) => (
                        <li key={field}>
                          <span className="font-medium capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</span>: {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {updateMutation.isSuccess && (
              <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-emerald-800">Product Updated Successfully</h4>
                    <p className="text-sm text-emerald-700">Redirecting to product page...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
