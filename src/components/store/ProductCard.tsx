/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Product } from '../../types';
import { useApp } from '../../lib/store/AppContext';
import { formatINR } from '../../lib/utils/formatters';
import { Plus, Check, Lamp, Armchair, Box, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

const DEFAULT_PRODUCT_IMAGES: Record<string, string> = {
  prod_01: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=80',
  prod_02: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=900&q=80',
  prod_03: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=900&q=80',
  prod_04: 'https://images.unsplash.com/photo-1533090161767-e6ffed986b88?auto=format&fit=crop&w=900&q=80',
  prod_05: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=900&q=80',
  prod_06: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=900&q=80',
  prod_07: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80',
  prod_08: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80',
  lighting: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=80',
  furniture: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=900&q=80',
  rugs: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=900&q=80',
  accessories: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=900&q=80',
  wall_decor: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=900&q=80',
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart, cart } = useApp();
  const [justAdded, setJustAdded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  const cartItem = cart.find(ci => ci.product.id === product.id);
  const isOutOfStock = product.stock_quantity <= 0;
  const displayImageUrl = product.image_url || DEFAULT_PRODUCT_IMAGES[product.id] || DEFAULT_PRODUCT_IMAGES[product.category];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  // Domain visual fallback rendering per Zero-Broken-Image Policy
  const getCategoryIcon = () => {
    switch (product.category) {
      case 'lighting':
        return <Lamp className="w-10 h-10 text-amber-700/60" />;
      case 'furniture':
        return <Armchair className="w-10 h-10 text-stone-700/60" />;
      case 'rugs':
        return <Box className="w-10 h-10 text-stone-600/60" />;
      default:
        return <Sparkles className="w-10 h-10 text-stone-600/60" />;
    }
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:border-stone-400 hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Product Image Slot with Real Photography or Resilient Architectural Fallback */}
      <div className={`relative aspect-4/3 w-full bg-gradient-to-br ${product.image_color_tone || 'from-stone-100 to-amber-50'} overflow-hidden border-b border-stone-100 flex items-center justify-center`}>
        {displayImageUrl && !imageError ? (
          <img
            src={displayImageUrl}
            alt={product.name}
            onError={() => setImageError(true)}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="relative z-10 flex flex-col items-center text-center p-6">
            <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-xs border border-white/80 shadow-xs mb-2 group-hover:scale-105 transition-transform duration-200">
              {getCategoryIcon()}
            </div>
            <span className="text-[11px] font-medium text-stone-500 tracking-wider uppercase font-mono">
              {product.sku}
            </span>
          </div>
        )}

        {/* Stock Notice Overlay */}
        {isOutOfStock ? (
          <span className="absolute top-3 left-3 text-[10px] uppercase font-semibold text-red-700 bg-red-50/95 border border-red-200 px-2 py-0.5 rounded shadow-xs">
            Sold Out
          </span>
        ) : product.stock_quantity <= 5 ? (
          <span className="absolute top-3 left-3 text-[10px] uppercase font-semibold text-amber-800 bg-amber-50/95 border border-amber-200 px-2 py-0.5 rounded shadow-xs">
            Only {product.stock_quantity} left
          </span>
        ) : null}

        {/* Quick Add Button Hover Overlay */}
        <button
          onClick={handleQuickAdd}
          disabled={isOutOfStock}
          aria-label={`Add ${product.name} to cart`}
          className="absolute bottom-3 right-3 p-2 rounded-xl bg-stone-900 text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-stone-800 disabled:opacity-0 cursor-pointer"
        >
          {justAdded ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* Card Details */}
      <div className="p-4.5 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Zero-Pill Unboxed Category */}
          <div className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold mb-1">
            {product.category.replace('_', ' ')}
          </div>
          <h3 className="text-sm font-semibold text-stone-900 line-clamp-1 group-hover:text-amber-800 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-stone-100">
          <div>
            <span className="font-mono text-sm font-bold text-stone-900 tabular-nums">
              {formatINR(product.price_paise)}
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              justAdded
                ? 'bg-emerald-50 text-emerald-700'
                : isOutOfStock
                ? 'text-stone-400 bg-stone-100 cursor-not-allowed'
                : 'text-stone-800 hover:bg-stone-100'
            }`}
          >
            {justAdded ? (
              <span className="flex items-center gap-1 text-[11px]">
                <Check className="w-3 h-3 text-emerald-600" /> Added
              </span>
            ) : isOutOfStock ? (
              'Unavailable'
            ) : cartItem ? (
              <span className="text-[11px] font-semibold text-stone-900">In Bag ({cartItem.quantity})</span>
            ) : (
              '+ Add to Bag'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
