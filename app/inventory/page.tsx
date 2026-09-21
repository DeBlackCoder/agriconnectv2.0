'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Navbar, Footer } from '@/components/layout';
import { Card, Button, Badge, LoadingSpinner, Input, ConfirmModal } from '@/components/ui';
import { Package, Plus, Search, Edit, AlertTriangle, Leaf, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui';

export default function InventoryPage() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{id: string, name: string} | null>(null);
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-products'],
    queryFn: async () => {
      const res = await fetch('/api/products/my-products');
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete product');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
      addToast('Product deleted successfully', 'success');
    },
    onError: () => {
      addToast('Failed to delete product', 'error');
    },
  });

  const handleDeleteClick = (product: any) => {
    setProductToDelete({ id: product._id, name: product.name });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id);
    }
  };

  const products = data?.data?.products || [];
  const lowStockProducts = products.filter((p: any) => p.stock <= 10 && p.stock > 0);
  const outOfStockProducts = products.filter((p: any) => p.stock === 0);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Inventory Management</h1>
            <p className="text-muted">Manage your product listings and stock levels</p>
          </div>
          <Link href="/products/create">
            <Button variant="neural">
              <Plus className="w-5 h-5 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card variant="neural" className="p-6">
            <div className="text-3xl font-bold gradient-text mb-1">{products.length}</div>
            <div className="text-sm text-muted">Total Products</div>
          </Card>
          <Card variant="neural" className="p-6">
            <div className="text-3xl font-bold text-green-400 mb-1">
              {products.filter((p: any) => p.stock > 10).length}
            </div>
            <div className="text-sm text-muted">In Stock</div>
          </Card>
          <Card variant="neural" className="p-6">
            <div className="text-3xl font-bold text-yellow-400 mb-1">{lowStockProducts.length}</div>
            <div className="text-sm text-muted">Low Stock</div>
          </Card>
          <Card variant="neural" className="p-6">
            <div className="text-3xl font-bold text-red-400 mb-1">{outOfStockProducts.length}</div>
            <div className="text-sm text-muted">Out of Stock</div>
          </Card>
        </div>

        {/* Alerts */}
        {lowStockProducts.length > 0 && (
          <Card variant="glass" className="p-4 mb-6 border border-yellow-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-400">Low Stock Alert</p>
                <p className="text-sm text-muted">
                  {lowStockProducts.length} product(s) running low on stock
                </p>
              </div>
            </div>
          </Card>
        )}

        {isLoading ? (
          <LoadingSpinner fullScreen />
        ) : products.length === 0 ? (
          <Card variant="glass" className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted" />
            <p className="text-muted text-lg mb-4">No products in inventory</p>
            <Link href="/products/create">
              <Button variant="neural">Add Your First Product</Button>
            </Link>
          </Card>
        ) : (
          <Card variant="glass-elevated" className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-2 font-medium text-muted">Product</th>
                    <th className="text-left py-4 px-2 font-medium text-muted">Category</th>
                    <th className="text-right py-4 px-2 font-medium text-muted">Price</th>
                    <th className="text-right py-4 px-2 font-medium text-muted">Stock</th>
                    <th className="text-center py-4 px-2 font-medium text-muted">Status</th>
                    <th className="text-right py-4 px-2 font-medium text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: any) => (
                    <tr key={product._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-2">
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
                          <div>
                            <Link href={`/products/${product._id}`}>
                              <p className="font-medium hover:text-primary-neural transition-colors">
                                {product.name}
                              </p>
                            </Link>
                            {product.isOrganic && (
                              <span className="text-xs text-green-400 flex items-center gap-1">
                                <Leaf className="w-3 h-3" />
                                Organic
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-muted">{product.category}</td>
                      <td className="py-4 px-2 text-right font-medium">
                        ₦{product.price?.toLocaleString()}
                        <span className="text-xs text-muted">/{product.unit}</span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <span className={`font-medium ${
                          product.stock === 0 ? 'text-red-400' :
                          product.stock <= 10 ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {product.stock}
                        </span>
                        <span className="text-xs text-muted ml-1">{product.unit}s</span>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <Badge 
                          variant={
                            product.stock === 0 ? 'error' :
                            product.stock <= 10 ? 'warning' :
                            'success'
                          }
                          size="sm"
                        >
                          {product.stock === 0 ? 'Out of Stock' :
                           product.stock <= 10 ? 'Low Stock' :
                           'In Stock'}
                        </Badge>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/products/${product._id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteClick(product)}
                            className="hover:bg-red-500/10 hover:border-red-500/50"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <Footer />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone and will remove the product from your inventory permanently.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        variant="danger"
        icon="delete"
      />
    </div>
  );
}
