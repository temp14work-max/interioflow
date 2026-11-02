/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../lib/store/AppContext';
import { formatINR, formatDate } from '../../lib/utils/formatters';
import { Package, ShieldCheck, Truck, CheckCircle2, ArrowRight } from 'lucide-react';

interface OrdersViewProps {
  onNavigateToShop: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onNavigateToShop }) => {
  const { orders } = useApp();

  // Row level security already limits this to what the signed-in user may see.
  const displayOrders = orders;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Title */}
      <div className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
          Store Transactions
        </span>
        <h1 className="text-3xl sm:text-4xl font-semibold text-stone-900 font-serif">
          Order History & Receipts
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-xl leading-relaxed">
          Track fulfillment status, view immutable item snapshots, and review your demo payment receipts.
        </p>
      </div>

      {displayOrders.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-stone-200 space-y-4">
          <Package className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-lg font-semibold text-stone-800 font-serif">
            No orders placed yet
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
            When you purchase lighting, furniture, or home décor accessories, your verified orders and receipts will appear here.
          </p>
          <button
            onClick={onNavigateToShop}
            className="px-5 py-2.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-xl cursor-pointer shadow-xs inline-flex items-center gap-2"
          >
            <span>Explore Décor Store</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {displayOrders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden"
            >
              {/* Order Header Strip */}
              <div className="p-5 bg-stone-50/70 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                      Order Reference
                    </span>
                    <span className="font-mono font-bold text-stone-900">
                      {order.order_number}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-stone-200 hidden sm:block" />
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                      Date Placed
                    </span>
                    <span className="text-stone-700 font-medium">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-stone-200 hidden sm:block" />
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                      Payment
                    </span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Demo payment
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-semibold capitalize ${
                      order.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : order.status === 'shipped'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : order.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items Snapshot Table */}
              <div className="p-5 divide-y divide-stone-100">
                {order.items.map(item => (
                  <div key={item.id} className="py-3 flex items-center justify-between text-xs gap-4">
                    <div>
                      <div className="font-semibold text-stone-900">
                        {item.product_name_snapshot}
                      </div>
                      <div className="text-[11px] text-stone-400 font-mono">
                        SKU: {item.sku_snapshot} · Unit Price: {formatINR(item.unit_price_paise)}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-stone-500 mr-4">Qty: {item.quantity}</span>
                      <span className="font-mono font-bold text-stone-900 tabular-nums">
                        {formatINR(item.line_total_paise)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer & Breakdown */}
              <div className="p-5 bg-stone-50/50 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div>
                  <span className="text-stone-400 block text-[11px]">Delivery Address:</span>
                  <span className="text-stone-800 font-medium">
                    {order.shipping_address.full_name}, {order.shipping_address.street}, {order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.postal_code}
                  </span>
                  {order.payment_reference && (
                    <div className="text-[10px] font-mono text-stone-400 mt-0.5">
                      Reference: {order.payment_reference}
                    </div>
                  )}
                </div>

                <div className="text-right space-y-0.5 sm:border-l sm:border-stone-200 sm:pl-6">
                  <div className="text-[11px] text-stone-500">
                    Subtotal: <span className="font-mono">{formatINR(order.subtotal_paise)}</span> · Shipping: <span className="font-mono">{order.shipping_paise === 0 ? 'FREE' : formatINR(order.shipping_paise)}</span> · GST: <span className="font-mono">{formatINR(order.tax_paise)}</span>
                  </div>
                  <div className="text-base font-bold font-mono text-stone-900 tabular-nums pt-1">
                    Total: {formatINR(order.total_paise)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
