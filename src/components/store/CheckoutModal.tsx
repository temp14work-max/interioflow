/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth/AuthContext';
import { useApp } from '../../lib/store/AppContext';
import { formatINR } from '../../lib/utils/formatters';
import { ShippingAddressSchema } from '../../lib/validation/schemas';
import { Order } from '../../types';
import { X, CheckCircle2, AlertTriangle, ArrowRight, Lock, FlaskConical } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCompleted?: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderCompleted,
}) => {
  const { currentUser } = useAuth();
  const { cart, cartTotalPaise, placeDemoOrder } = useApp();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [step, setStep] = useState<'address' | 'payment' | 'success' | 'failed'>('address');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (currentUser) {
      setFullName(prev => prev || currentUser.display_name);
      setPhone(prev => prev || currentUser.phone || '');
    }
  }, [currentUser]);

  // Display estimate only: place_demo_order recalculates the real total in the database.
  const shippingPaise = cartTotalPaise >= 1000000 ? 0 : 49900;
  const taxPaise = Math.round(cartTotalPaise * 0.18);
  const grandTotalPaise = cartTotalPaise + shippingPaise + taxPaise;

  if (!isOpen) return null;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = ShippingAddressSchema.safeParse({
      full_name: fullName,
      phone,
      street,
      apartment,
      city,
      state,
      postal_code: postalCode,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach(err => {
        fieldErrors[err.path.join('.')] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setStep('payment');
  };

  const handleDemoPayment = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    try {
      const order = await placeDemoOrder({
        full_name: fullName,
        phone,
        street,
        apartment,
        city,
        state,
        postal_code: postalCode,
      });
      setCompletedOrder(order);
      setStep('success');
      if (onOrderCompleted) onOrderCompleted(order);
    } catch (err: any) {
      setErrorMessage(err.message || 'The order could not be placed.');
      setStep('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseAndReset = () => {
    setStep('address');
    setCompletedOrder(null);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/70">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-stone-600" />
            <h3 className="text-base font-semibold text-stone-900 font-serif">
              {step === 'address' && 'Delivery Information'}
              {step === 'payment' && 'Demo Payment'}
              {step === 'success' && 'Order Confirmed'}
              {step === 'failed' && 'Payment Unsuccessful'}
            </h3>
          </div>
          <button
            onClick={handleCloseAndReset}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Address Form */}
        {step === 'address' && (
          <form onSubmit={handleProceedToPayment} className="p-6 space-y-4">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-600 flex justify-between items-center">
              <span>Bag Total ({cart.length} items):</span>
              <span className="font-mono font-bold text-stone-900">{formatINR(grandTotalPaise)}</span>
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Please correct the delivery details:</div>
                  <ul className="list-disc list-inside mt-1">
                    {Object.values(errors).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Aditi Sharma"
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Contact Mobile Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="9845012345"
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Street Address & House / Building Name *
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  placeholder="e.g. 42 Orchid Woods, Borewell Road"
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Apartment / Suite / Landmark
                </label>
                <input
                  type="text"
                  value={apartment}
                  onChange={e => setApartment(e.target.value)}
                  placeholder="e.g. Penthouse 1402, Near Metro Station"
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Postal PIN Code *
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                  placeholder="560066"
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Bengaluru"
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  placeholder="Karnataka"
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900"
                  required
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleCloseAndReset}
                className="text-xs text-stone-500 hover:text-stone-800"
              >
                Back to Shopping
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Demo Payment */}
        {step === 'payment' && (
          <div className="p-6 space-y-5">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
              <FlaskConical className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Demo payment: no money is charged</div>
                <p className="mt-0.5 leading-relaxed">
                  Real payments are not switched on yet. Confirming places a test order and updates stock.
                </p>
              </div>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-1 text-stone-600">
              <div className="flex justify-between">
                <span>Recipient:</span>
                <span className="font-medium text-stone-900">{fullName} ({phone})</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Address:</span>
                <span className="text-stone-900 truncate max-w-[280px]">{street}, {city}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-stone-200/60">
                <span>Total (including GST and shipping):</span>
                <span className="font-mono font-bold text-stone-900 tabular-nums">{formatINR(grandTotalPaise)}</span>
              </div>
            </div>

            <button
              onClick={handleDemoPayment}
              disabled={isProcessing}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isProcessing ? 'Placing demo order...' : `Confirm demo payment of ${formatINR(grandTotalPaise)}`}</span>
            </button>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <button onClick={() => setStep('address')} className="hover:text-stone-900 cursor-pointer">
                ← Edit Shipping Address
              </button>
              <button
                onClick={() => {
                  setErrorMessage('This is a simulated decline. No order was placed.');
                  setStep('failed');
                }}
                className="hover:text-stone-900 cursor-pointer"
              >
                Simulate a declined payment
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success Receipt */}
        {step === 'success' && completedOrder && (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <h4 className="text-xl font-semibold text-stone-900 font-serif">
              Demo Order Confirmed
            </h4>
            
            <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
              Your order <strong className="text-stone-900 font-mono">{completedOrder.order_number}</strong> has been placed and stock is updated. This was a demo payment, so no money was charged.
            </p>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Order Number:</span>
                <span className="font-mono font-bold text-stone-900">{completedOrder.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Demo Payment Reference:</span>
                <span className="font-mono text-stone-800">{completedOrder.payment_reference}</span>
              </div>
              {completedOrder.payment_method && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Payment Channel:</span>
                  <span className="font-mono text-stone-800 capitalize">
                    {completedOrder.payment_method.replace(/_/g, ' ')}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-500">Order Total (not charged):</span>
                <span className="font-mono font-bold text-stone-900">{formatINR(completedOrder.total_paise)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Deliver to:</span>
                <span className="text-stone-800">{completedOrder.shipping_address.street}, {completedOrder.shipping_address.city}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={handleCloseAndReset}
                className="px-5 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg cursor-pointer"
              >
                Close & View Orders
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Payment Failed */}
        {step === 'failed' && (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h4 className="text-xl font-semibold text-stone-900 font-serif">
              Order Not Placed
            </h4>

            <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
              {errorMessage || 'The order could not be placed. No money was charged.'}
            </p>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setStep('payment')}
                className="px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer"
              >
                Try Payment Again
              </button>
              <button
                onClick={handleCloseAndReset}
                className="px-4 py-2 text-xs font-medium text-stone-500 hover:text-stone-800"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
