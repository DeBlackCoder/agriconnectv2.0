'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar, Footer } from '@/components/layout';
import { Card, Button, Badge, LoadingSpinner, Alert, Input, ProductDetailSkeleton } from '@/components/ui';
import { Star, MapPin, Package, Heart, ShoppingCart, User, Truck, Shield, Leaf, CheckCircle, Plus, Minus, Share2, TrendingUp } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import { ReviewForm, ReviewList, ReviewSummary } from '@/components/reviews';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const productId = params.id as string;
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [minLoadingPassed, setMinLoadingPassed] = useState(false);
  const { addToCart } = useCart();
  
  // We'll set quantity after product loads
  const [quantity, setQuantity] = useState(1);

  // Minimum loading time of 800ms to show skeleton
  React.useEffect(() => {
    setMinLoadingPassed(false);
    const timer = setTimeout(() => {
      setMinLoadingPassed(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [productId]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      console.log('Fetching product:', productId);
      const res = await fetch(`/api/products/${productId}`);
      if (!res.ok) throw new Error('Failed to fetch product');
      return res.json();
    },
    enabled: !!productId, // Only run if we have a productId
    staleTime: 30000, // Cache for 30 seconds
  });

  console.log('Product query state:', { isLoading, hasData: !!data, error });

  const { data: relatedData } = useQuery({
    queryKey: ['related-products', productId],
    queryFn: async () => {
      const res = await fetch(`/api/products/${productId}/related`);
      if (!res.ok) return { data: { products: [] } };
      return res.json();
    },
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const res = await fetch(`/api/reviews?productId=${productId}&limit=50`);
      if (!res.ok) return { data: { reviews: [] } };
      return res.json();
    },
  });

  const { data: authData } = useQuery({
    queryKey: ['auth-check'],
    queryFn: async () => {
      const res = await fetch('/api/auth/check');
      if (!res.ok) return { data: null };
      return res.json();
    },
  });

  const addToWishlist = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error('Failed to add to wishlist');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Added to wishlist!');
    },
    onError: () => {
      toast.error('Failed to add to wishlist');
    },
  });

  const product = data?.data;
  const relatedProducts = relatedData?.data?.products || [];
  const reviews = reviewsData?.data?.reviews || [];
  const currentUser = authData?.data;

  // Reset state when product changes
  React.useEffect(() => {
    setSelectedImage(0);
    setShowReviewForm(false);
  }, [productId]);

  // Set quantity to minOrder when product loads
  const minOrderQty = product?.minOrder || 1;
  
  // Update quantity when product loads or minOrder changes
  React.useEffect(() => {
    if (product && product.minOrder) {
      setQuantity(product.minOrder);
    }
  }, [product?.minOrder]); // Only depend on minOrder, not the whole product

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      setAddingToCart(true);
      await addToCart(productId, quantity);
      toast.success(`${quantity} ${product.unit}(s) added to cart!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    const minOrderQty = product?.minOrder || 1;
    if (product && quantity > minOrderQty) {
      setQuantity(quantity - 1);
    }
  };

  // Show skeleton if loading or minimum time hasn't passed
  const showSkeleton = isLoading || !data || !minLoadingPassed;

  if (showSkeleton) {
    console.log('Showing skeleton...');
    return (
      <>
        <Navbar />
        <ProductDetailSkeleton />
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <Link href="/products">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const images = product.images?.length > 0 ? product.images : [];
  const hasImages = images.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-green-600">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-green-600">Products</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category}`} className="hover:text-green-600">{product.category}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-xl overflow-hidden shadow-sm aspect-square">
              {hasImages ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Package className="w-24 h-24 text-gray-300" />
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-green-600' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {product.location || 'Nigeria'}
                    </span>
                    {product.averageRating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium text-gray-900">{product.averageRating.toFixed(1)}</span>
                        <span className="text-gray-500">({product.reviewCount} reviews)</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => addToWishlist.mutate()}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    aria-label="Add to wishlist"
                  >
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    aria-label="Share"
                  >
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="primary">{product.category}</Badge>
                {product.isOrganic && (
                  <Badge variant="success" className="flex items-center gap-1">
                    <Leaf className="w-3 h-3" />
                    Organic
                  </Badge>
                )}
                {product.isCertified && (
                  <Badge variant="info" className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Certified
                  </Badge>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="bg-green-50 rounded-xl p-6">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold text-green-600">₦{product.price?.toLocaleString()}</span>
                <span className="text-gray-600">/ {product.unit}</span>
              </div>
              <p className="text-sm text-gray-600">Inclusive of all taxes</p>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">About this product</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Stock & Min Order */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Available Stock</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{product.stock} {product.unit}s</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Minimum Order</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{product.minOrder || 1} {product.unit}s</p>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <label className="font-semibold text-gray-900">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= (product.minOrder || 1)}
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-xl font-bold text-gray-900 w-12 text-center">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <Button
                fullWidth
                disabled={product.stock === 0 || addingToCart || quantity < minOrderQty}
                onClick={handleAddToCart}
                className="bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {addingToCart ? (
                  'Adding to Cart...'
                ) : product.stock === 0 ? (
                  'Out of Stock'
                ) : quantity < minOrderQty ? (
                  `Minimum Order: ${minOrderQty} ${product.unit}s`
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart - ₦{(product.price * quantity).toLocaleString()}
                  </>
                )}
              </Button>
              
              {quantity < minOrderQty && (
                <p className="text-sm text-red-600 text-center mt-2">
                  Please select at least {minOrderQty} {product.unit}s to meet the minimum order requirement
                </p>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Secure Payment</p>
              </div>
              <div className="text-center">
                <Truck className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Fast Delivery</p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Quality Assured</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seller Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-12">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Sold By</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900">{product.seller?.name || 'Seller'}</h4>
              <p className="text-sm text-gray-600">Verified Farmer</p>
            </div>
            <Link href={`/sellers/${product.seller?._id}`}>
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                View Store
              </Button>
            </Link>
          </div>
          
          {/* Contact Information */}
          {product.seller && (
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <h4 className="font-semibold text-gray-900 mb-3">Contact Seller</h4>
              {product.seller.email && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="font-medium">Email:</span>
                  <a 
                    href={`mailto:${product.seller.email}`}
                    className="text-green-600 hover:underline"
                  >
                    {product.seller.email}
                  </a>
                </div>
              )}
              {product.seller.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="font-medium">Phone:</span>
                  <a 
                    href={`tel:${product.seller.phone}`}
                    className="text-green-600 hover:underline"
                  >
                    {product.seller.phone}
                  </a>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-3">
                Contact the seller directly for delivery arrangements and payment details after placing your order.
              </p>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Customer Reviews</h2>
            {currentUser && !showReviewForm && (
              <Button
                onClick={() => setShowReviewForm(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <Star className="w-4 h-4" />
                Write a Review
              </Button>
            )}
          </div>

          {showReviewForm && (
            <div className="mb-8">
              <ReviewForm
                productId={productId}
                productName={product.name}
                onSuccess={() => {
                  setShowReviewForm(false);
                  queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
                  queryClient.invalidateQueries({ queryKey: ['product', productId] });
                }}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          )}

          {reviews.length > 0 && (
            <div className="mb-6">
              <ReviewSummary
                averageRating={product.averageRating || 0}
                reviewCount={product.reviewCount || 0}
              />
            </div>
          )}

          <ReviewList
            reviews={reviews}
            currentUserId={currentUser?._id}
            onHelpfulClick={() => {
              queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
            }}
          />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((relProduct: any) => (
                <Link key={relProduct._id} href={`/products/${relProduct._id}`}>
                  <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gray-100 relative">
                      {relProduct.images?.[0] ? (
                        <img
                          src={relProduct.images[0]}
                          alt={relProduct.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{relProduct.name}</h3>
                      <p className="text-lg font-bold text-green-600">
                        ₦{relProduct.price?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
