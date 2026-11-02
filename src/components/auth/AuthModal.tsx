/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { X, Lock, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    currentUser,
    logout,
  } = useAuth();

  const { isSignedIn, user } = useUser();

  const [mode, setMode] = useState<'signin' | 'signup'>(authModalMode);

  React.useEffect(() => {
    setMode(authModalMode);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/70">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-stone-700" />
            <div>
              <h3 className="text-sm font-semibold text-stone-900 font-serif">
                {isSignedIn ? 'Account Details' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </h3>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            aria-label="Close modal"
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Already Signed In via Clerk */}
        {isSignedIn && user ? (
          <div className="p-6 space-y-5 text-center">
            <div className="w-16 h-16 rounded-full mx-auto overflow-hidden border-2 border-stone-900 shadow-md">
              <img
                src={user.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={user.fullName || 'User Avatar'}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="text-base font-semibold text-stone-900 font-serif">
                {user.fullName || user.firstName || 'Client'}
              </h4>
              <p className="text-xs text-stone-500 font-mono mt-0.5">
                {user.primaryEmailAddress?.emailAddress}
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 rounded-full text-xs font-semibold text-stone-800 border border-stone-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Role: {currentUser?.role?.toUpperCase() || 'CUSTOMER'}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  logout();
                  closeAuthModal();
                }}
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors"
              >
                Sign Out
              </button>
              <button
                onClick={closeAuthModal}
                className="px-4 py-2 border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-medium rounded-lg cursor-pointer transition-colors"
              >
                Continue to App
              </button>
            </div>
          </div>
        ) : (
          /* Live Clerk Authentication Component */
          <div className="p-4 sm:p-6 space-y-4">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl text-xs font-semibold text-stone-600">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Clerk's Real Embedded Component */}
            <div className="flex justify-center items-center py-2">
              {mode === 'signin' ? (
                <SignIn
                  routing="hash"
                  appearance={{
                    elements: {
                      rootBox: 'w-full shadow-none',
                      card: 'shadow-none border-0 p-0 w-full bg-transparent',
                      headerTitle: 'font-serif text-lg text-stone-900 text-center',
                      headerSubtitle: 'text-xs text-stone-500 text-center',
                      socialButtonsBlockButton:
                        'border border-stone-200 hover:bg-stone-50 text-stone-800 text-xs font-medium rounded-xl py-2.5',
                      dividerLine: 'bg-stone-200',
                      dividerText: 'text-[11px] text-stone-400 font-mono',
                      formFieldLabel: 'text-[11px] font-semibold text-stone-700 tracking-wider',
                      formFieldInput:
                        'border-stone-200 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 rounded-xl text-xs py-2 bg-stone-50 focus:bg-white',
                      formButtonPrimary:
                        'bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold py-2.5 shadow-sm transition-colors',
                      footerActionLink: 'text-stone-900 font-semibold hover:underline',
                      footerActionText: 'text-xs text-stone-500',
                    },
                  }}
                />
              ) : (
                <SignUp
                  routing="hash"
                  appearance={{
                    elements: {
                      rootBox: 'w-full shadow-none',
                      card: 'shadow-none border-0 p-0 w-full bg-transparent',
                      headerTitle: 'font-serif text-lg text-stone-900 text-center',
                      headerSubtitle: 'text-xs text-stone-500 text-center',
                      socialButtonsBlockButton:
                        'border border-stone-200 hover:bg-stone-50 text-stone-800 text-xs font-medium rounded-xl py-2.5',
                      dividerLine: 'bg-stone-200',
                      dividerText: 'text-[11px] text-stone-400 font-mono',
                      formFieldLabel: 'text-[11px] font-semibold text-stone-700 tracking-wider',
                      formFieldInput:
                        'border-stone-200 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 rounded-xl text-xs py-2 bg-stone-50 focus:bg-white',
                      formButtonPrimary:
                        'bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold py-2.5 shadow-sm transition-colors',
                      footerActionLink: 'text-stone-900 font-semibold hover:underline',
                      footerActionText: 'text-xs text-stone-500',
                    },
                  }}
                />
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
