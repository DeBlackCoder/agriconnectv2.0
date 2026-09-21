'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Navbar, Footer } from '@/components/layout';
import { Card, Button, Badge, Input, LoadingSpinner, ProductsListSkeleton } from '@/components/ui';
import { Search, Filter, Star, MapPin, Leaf, Apple, Wheat, SlidersHorizontal, X, ChevronDown } from 'lucide-react';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isOrganic, setIsOrganic] = useState<boolean | undefined>(undefined);
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', search, category, minPrice, maxPrice, isOrganic, location, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (isOrganic !== undefined) params.append('isOrganic', String(isOrganic));
      if (location) params.append('location', location);
      
      // Map sortBy to API parameters
      if (sortBy === 'price-low') params.append('sortBy', 'price-asc');
      else if (sortBy === 'price-high') params.append('sortBy', 'price-desc');
      else if (sortBy === 'rating') params.append('sortBy', 'rating');
      else params.append('sortBy', 'newest');
      
      params.append('limit', '50');
      
      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  const products = data?.data?.products || [];

  const categories = ['Vegetables', 'Fruits', 'Grains', 'Tubers', 'Legumes', 'Spices'];
  const locations = ['Lagos', 'Ogun', 'Oyo', 'Kano', 'Rivers', 'Kaduna', 'Plateau', 'Benue'];

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setIsOrganic(undefined);
    setLocation('');
    setSortBy('newest');
  };

  const activeFilterCount = [
    category,
    minPrice,
    maxPrice,
    isOrganic !== undefined,
    location,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Fresh Produce Marketplace
          </h1>
          <p className="text-xl text-muted">
            Browse quality products directly from farmers
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                icon={<Search className="w-5 h-5" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-900">Filters</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Locations</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc} State
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Price (₦)
                  </label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price (₦)
                  </label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Any"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Organic Filter */}
              <div className="mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOrganic === true}
                    onChange={(e) => setIsOrganic(e.target.checked ? true : undefined)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-green-600" />
                    Organic Products Only
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Active Filter Chips */}
          {!showFilters && activeFilterCount > 0 && (
            <div className="flex gap-2 flex-wrap">
              {category && (
                <Badge variant="primary" className="flex items-center gap-1">
                  {category}
                  <button onClick={() => setCategory('')}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {location && (
                <Badge variant="primary" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {location}
                  <button onClick={() => setLocation('')}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {(minPrice || maxPrice) && (
                <Badge variant="primary" className="flex items-center gap-1">
                  ₦{minPrice || '0'} - ₦{maxPrice || '∞'}
                  <button
                    onClick={() => {
                      setMinPrice('');
                      setMaxPrice('');
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {isOrganic && (
                <Badge variant="success" className="flex items-center gap-1">
                  <Leaf className="w-3 h-3" />
                  Organic
                  <button onClick={() => setIsOrganic(undefined)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <ProductsListSkeleton />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400">Failed to load products</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-2">No products found</p>
            <p className="text-gray-500 text-sm mb-4">
              Try adjusting your filters or search terms
            </p>
            {activeFilterCount > 0 && (
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Found <span className="font-semibold text-gray-900">{products.length}</span> product{products.length !== 1 ? 's' : ''}
              </p>
              <div className="text-sm text-gray-500">
                Sorted by: {sortBy === 'newest' ? 'Newest First' : sortBy === 'price-low' ? 'Price: Low to High' : sortBy === 'price-high' ? 'Price: High to Low' : 'Highest Rated'}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product: any) => (
                <Link key={product._id} href={`/products/${product._id}`}>
                  <Card variant="neural" hoverable className="h-full">
                    <div className="relative h-48 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-t-xl overflow-hidden">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={`https://images.unsplash.com/photo-${
                            product.category === 'Vegetables' ? '1540420773-1ae777771ae4' :
                            product.category === 'Fruits' ? '1619566636858-adf3ef46400b' :
                            product.category === 'Grains' ? '1574323626662-0af9c1c281b1' :
                            '1560493676-04071c5f467b'
                          }?w=400&q=80`}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {product.isOrganic && (
                        <Badge variant="success" className="absolute top-3 right-3 flex items-center gap-1">
                          <Leaf className="w-3 h-3" />
                          Organic
                        </Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-muted text-sm mb-3">{product.category}</p>
                      
                      <div className="flex items-center gap-2 mb-3 text-sm text-muted">
                        <MapPin className="w-4 h-4" />
                        {product.location?.state || 'Nigeria'}
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-2xl font-bold gradient-text">
                            ₦{product.price?.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted">per {product.unit}</div>
                        </div>
                        {product.rating?.average > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-medium">
                              {product.rating.average.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      {product.stock <= 10 && product.stock > 0 && (
                        <Badge variant="warning" className="mt-3">
                          Only {product.stock} left
                        </Badge>
                      )}
                      {product.stock === 0 && (
                        <Badge variant="error" className="mt-3">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
