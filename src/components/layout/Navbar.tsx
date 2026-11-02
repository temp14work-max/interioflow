/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/AuthContext';
import { useApp } from '../../lib/store/AppContext';
import { ShoppingBag, LogOut, ChevronDown, User } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenCart: () => void;
  onOpenConsultationModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenCart,
  onOpenConsultationModal,
}) => {
  const { currentUser, isAuthenticated, logout, openAuthModal } = useAuth();
  const { cartItemCount } = useApp();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const getWorkspaceTabLabel = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case 'designer':
        return 'Designer Studio';
      case 'contractor':
        return 'Field Milestones';
      case 'admin':
        return 'Admin Console';
      case 'customer':
      default:
        return 'My Projects';
    }
  };

  const workspaceLabel = getWorkspaceTabLabel();

  return (
    <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="group flex items-center gap-2.5 text-left shrink-0 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center font-serif text-lg font-bold shadow-xs">
            I
          </div>
          <span className="text-xl font-semibold tracking-tight text-stone-900 font-serif whitespace-nowrap">
            InterioFlow
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <button
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              currentTab === 'home' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : 'hover:text-stone-900'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => onNavigate('services')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              currentTab === 'services' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : 'hover:text-stone-900'
            }`}
          >
            Design Services
          </button>

          <button
            onClick={() => onNavigate('shop')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              currentTab === 'shop' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : 'hover:text-stone-900'
            }`}
          >
            Décor Store
          </button>

          {/* Role-based Workspace Link (shown only for authenticated users) */}
          {isAuthenticated && workspaceLabel && (
            <button
              onClick={() => onNavigate('projects')}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
                currentTab === 'projects' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : 'hover:text-stone-900'
              }`}
            >
              {workspaceLabel}
            </button>
          )}

          {/* Orders page for Customers & Admins */}
          {isAuthenticated && (currentUser?.role === 'customer' || currentUser?.role === 'admin') && (
            <button
              onClick={() => onNavigate('orders')}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
                currentTab === 'orders' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : 'hover:text-stone-900'
              }`}
            >
              Orders
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Actions & User Auth */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Shopping Bag Icon with Live Counter */}
          <button
            onClick={onOpenCart}
            aria-label="View shopping cart"
            className="relative p-2 text-stone-700 hover:text-stone-950 transition-colors rounded-lg hover:bg-stone-100 cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-amber-700 text-[10px] font-bold text-white shadow-xs">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Request Consultation Button */}
          <button
            onClick={onOpenConsultationModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>Request Consultation</span>
          </button>

          {/* Authentication State Controller */}
          {isAuthenticated && currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-stone-800 bg-white border border-stone-200 hover:border-stone-400 rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <div className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.display_name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[110px] truncate">{currentUser.display_name}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-xl border border-stone-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-stone-100 mb-1">
                      <p className="text-xs font-semibold text-stone-900 truncate">
                        {currentUser.display_name}
                      </p>
                      <p className="text-[11px] text-stone-500 font-mono truncate">
                        {currentUser.email}
                      </p>
                      <div className="mt-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-stone-100 text-stone-800 px-2 py-0.5 rounded border border-stone-200">
                          Role: {currentUser.role}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onNavigate('projects');
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded-lg text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <User className="w-3.5 h-3.5 text-stone-500" />
                        <span>Open {workspaceLabel}</span>
                      </button>

                      <div className="pt-1 mt-1 border-t border-stone-100">
                        <button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                            onNavigate('home');
                          }}
                          className="w-full text-left px-3 py-2 text-xs rounded-lg text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5 text-red-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('signin')}
                className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-950 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
              >
                Sign Up
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
