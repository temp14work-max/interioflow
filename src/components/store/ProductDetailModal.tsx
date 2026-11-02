/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../../types';
import { useApp } from '../../lib/store/AppContext';
import { formatINR } from '../../lib/utils/formatters';
import { X, Check, ShoppingBag, Truck, ShieldCheck, Ruler, Layers } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCart?: () => void;
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

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onOpenCart,
}) => {
  const { addToCart, cart } = useApp();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!isOpen || !product) return null;

  const cartItem = cart.find(item => item.product.id === product.id);
  const isOutOfStock = product.stock_quantity <= 0;
  const displayImageUrl = product.image_url || DEFAULT_PRODUCT_IMAGES[product.id] || DEFAULT_PRODUCT_IMAGES[product.category];

  const handleAdd = () => {
    if (isOutOfStock) return;
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      if (onOpenCart) {
        onClose();
        onOpenCart();
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-10 p-2 text-stone-500 hover:text-stone-900 bg-white/80 backdrop-blur-xs rounded-full border border-stone-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left: Product Visual Presentation with High-Res Photography */}
          <div className="relative min-h-[340px] md:min-h-[460px] bg-stone-100 flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-200 overflow-hidden">
            {displayImageUrl ? (
              <div className="w-full h-full relative group">
                <img
                  src={displayImageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-xs text-white">
                  <span className="font-mono text-[11px] uppercase tracking-wider">{product.sku}</span>
                  <span className="text-[11px] bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded">Studio Authentic</span>
                </div>
              </div>
            ) : (
              <div className={`p-8 w-full h-full bg-gradient-to-br ${product.image_color_tone || 'from-stone-100 to-amber-50'} flex flex-col items-center justify-center`}>
                <div className="p-8 rounded-3xl bg-white/80 backdrop-blur-xs border border-white/90 shadow-sm text-center">
                  <span className="font-mono text-xs uppercase tracking-widest text-stone-400 block mb-2">
                    {product.sku}
                  </span>
                  <div className="text-2xl font-serif font-bold text-stone-800">
                    {product.name}
                  </div>
                  <div className="mt-4 text-xs text-stone-500">
                    {product.category.replace('_', ' ').toUpperCase()} COLLECTION
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Contiguous Purchase Module */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Unboxed Metadata */}
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                <span className="uppercase tracking-wider font-semibold text-stone-700">
                  {product.category.replace('_', ' ')}
                </span>
                <span aria-hidden="true">·</span>
                <span>SKU: {product.sku}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-semibold text-stone-900 font-serif leading-tight">
                {product.name}
              </h2>

              {/* Price in paise */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-mono text-2xl font-bold text-stone-900 tabular-nums">
                  {formatINR(product.price_paise)}
                </span>
                <span className="text-xs text-stone-400">Incl. all taxes</span>
              </div>

              <p className="mt-4 text-xs text-stone-600 leading-relaxed">
                {product.description}
              </p>

              {/* Technical Specifications */}
              <div className="mt-5 space-y-2.5 pt-4 border-t border-stone-100 text-xs">
                {product.dimensions && (
                  <div className="flex items-center gap-2 text-stone-700">
                    <Ruler className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>Dimensions: <strong className="font-medium text-stone-900">{product.dimensions}</strong></span>
                  </div>
                )}
                {product.material && (
                  <div className="flex items-center gap-2 text-stone-700">
                    <Layers className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>Material: <strong className="font-medium text-stone-900">{product.material}</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-stone-700">
                  <Truck className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>Free insured shipping on orders above ₹10,000</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>Demo checkout: no money is charged</span>
                </div>
              </div>
            </div>

            {/* Purchase Controller */}
            <div className="pt-4 border-t border-stone-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500 font-medium">Inventory Availability:</span>
                {isOutOfStock ? (
                  <span className="text-red-700 font-semibold">Out of Stock</span>
                ) : (
                  <span className="text-emerald-700 font-semibold">
                    In Stock ({product.stock_quantity} available)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1 || isOutOfStock}
                    className="px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-200 disabled:opacity-30 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-xs font-mono font-medium text-stone-900 tabular-nums">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(Math.min(product.stock_quantity, qty + 1))}
                    disabled={qty >= product.stock_quantity || isOutOfStock}
                    className="px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-200 disabled:opacity-30 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  onClick={handleAdd}
                  disabled={isOutOfStock}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                    added
                      ? 'bg-emerald-800 text-white'
                      : isOutOfStock
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : 'bg-stone-900 hover:bg-stone-800 text-white'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Shopping Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag · {formatINR(product.price_paise * qty)}</span>
                    </>
                  )}
                </button>
              </div>

              {cartItem && (
                <div className="text-[11px] text-center text-stone-500">
                  You already have {cartItem.quantity} of this item in your shopping bag.
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
