/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../lib/store/AppContext';
import { formatINR } from '../../lib/utils/formatters';
import { X, Trash2, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const { cart, updateCartQuantity, removeFromCart, cartTotalPaise, cartItemCount } = useApp();

  if (!isOpen) return null;

  const FREE_SHIPPING_THRESHOLD_PAISE = 1000000; // ₹10,000.00
  const isFreeShipping = cartTotalPaise >= FREE_SHIPPING_THRESHOLD_PAISE;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD_PAISE - cartTotalPaise);
  const gstPaise = Math.round(cartTotalPaise * 0.18);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-stone-200">
          
          {/* Header */}
          <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-stone-900" />
              <h3 className="text-base font-semibold text-stone-900 font-serif">
                Shopping Bag
              </h3>
              <span className="text-xs text-stone-500">
                ({cartItemCount} {cartItemCount === 1 ? 'item' : 'items'})
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="px-6 py-3 bg-stone-100/70 border-b border-stone-200 text-xs">
            {isFreeShipping ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                Unlocked: Free White-Glove Shipping & Assembly
              </span>
            ) : (
              <span className="text-stone-600">
                Add <strong className="text-stone-900 font-mono">{formatINR(remainingForFreeShipping)}</strong> more to qualify for Free Shipping
              </span>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <ShoppingBag className="w-12 h-12 text-stone-300 stroke-[1.5]" />
                <h4 className="text-sm font-semibold text-stone-900 font-serif">
                  Your shopping bag is empty
                </h4>
                <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                  Explore our curated architectural home décor collection featuring lamps, chairs, rugs, and artisan accessories.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-4 py-2 text-xs font-medium bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Browse Décor Store
                </button>
              </div>
            ) : (
              cart.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-4 p-3 bg-stone-50/50 rounded-xl border border-stone-200/80"
                >
                  {/* Thumbnail */}
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${product.image_color_tone || 'from-stone-100 to-amber-50'} border border-stone-200 flex items-center justify-center font-mono text-[10px] text-stone-400 shrink-0`}>
                    {product.category.slice(0, 3).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-stone-900 truncate">
                          {product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="font-mono text-xs font-bold text-stone-900 mt-0.5 tabular-nums">
                        {formatINR(product.price_paise)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-stone-200 rounded-md bg-white">
                        <button
                          onClick={() => updateCartQuantity(product.id, quantity - 1)}
                          className="px-2 py-0.5 text-xs text-stone-600 hover:bg-stone-100 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-mono tabular-nums text-stone-900">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock_quantity}
                          className="px-2 py-0.5 text-xs text-stone-600 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-mono text-xs font-semibold text-stone-700 tabular-nums">
                        {formatINR(product.price_paise * quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-stone-100 bg-stone-50/70 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium text-stone-900 tabular-nums">
                    {formatINR(cartTotalPaise)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Standard Shipping</span>
                  <span className="font-mono font-medium text-stone-900 tabular-nums">
                    {isFreeShipping ? 'FREE' : formatINR(49900)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>GST (18%)</span>
                  <span className="font-mono font-medium text-stone-900 tabular-nums">
                    {formatINR(gstPaise)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-400 text-[11px]">
                  <span>Final price confirmed at checkout</span>
                  <span>Database verified</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
                <span className="text-sm font-semibold text-stone-900">Estimated Total</span>
                <span className="font-mono text-lg font-bold text-stone-900 tabular-nums">
                  {formatINR(cartTotalPaise + (isFreeShipping ? 0 : 49900) + gstPaise)}
                </span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <span>Proceed to Demo Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-[11px] text-center text-stone-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                <span>Demo checkout: no money is charged</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
