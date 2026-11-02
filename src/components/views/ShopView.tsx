/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../lib/store/AppContext';
import { ProductCard } from '../store/ProductCard';
import { Product, ProductCategory } from '../../types';
import { Search, SlidersHorizontal, Package, ShieldCheck } from 'lucide-react';

interface ShopViewProps {
  onSelectProduct: (product: Product) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ onSelectProduct }) => {
  const { products } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc'>('featured');

  // Filter only active products
  const activeProducts = products.filter(p => p.is_active);

  const filteredProducts = activeProducts.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price_paise - b.price_paise;
    if (sortBy === 'price_desc') return b.price_paise - a.price_paise;
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Décor' },
    { id: 'lighting', label: 'Lighting' },
    { id: 'furniture', label: 'Furniture' },
    { id: 'rugs', label: 'Rugs & Textiles' },
    { id: 'wall_decor', label: 'Wall Décor' },
    { id: 'accessories', label: 'Accessories' },
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Title & Introduction */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
          Direct Décor Collection
        </span>
        <h1 className="text-3xl sm:text-4xl font-semibold text-stone-900 font-serif">
          Curated Home Décor & Architectural Fixtures
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-2xl leading-relaxed">
          High-grade brass lighting, European oak furniture, and organic wool textiles. Selected by our design studio and dispatched directly with white-glove inspection.
        </p>
      </div>

      {/* Free Shipping Strip */}
      <div className="p-3 bg-stone-100 rounded-xl border border-stone-200/80 flex flex-wrap items-center justify-between text-xs text-stone-700 gap-2">
        <span className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          Complimentary Insured Delivery on all orders above ₹10,000 (10,00,000 paise).
        </span>
        <span className="text-stone-500 text-[11px]">
          All prices verified server-side at checkout
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
        
        {/* Interactive Segmented Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search lamps, chairs, rugs..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-stone-900 text-stone-900 placeholder:text-stone-400"
            />
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-700 font-medium cursor-pointer"
          >
            <option value="featured">Featured First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

      </div>

      {/* Product Grid */}
      {sortedProducts.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-stone-200 space-y-3">
          <Package className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-base font-semibold text-stone-800 font-serif">
            No products match your search
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try choosing a different category or clearing your search term.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-xs font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      )}

    </div>
  );
};
