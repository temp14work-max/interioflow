/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth/AuthContext';
import { AppProvider, useApp } from './lib/store/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { HomeView } from './components/views/HomeView';
import { ShopView } from './components/views/ShopView';
import { ServicesView } from './components/views/ServicesView';
import { OrdersView } from './components/views/OrdersView';
import { CustomerDashboard } from './components/dashboards/CustomerDashboard';
import { DesignerDashboard } from './components/dashboards/DesignerDashboard';
import { ContractorDashboard } from './components/dashboards/ContractorDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { ProjectDetailView } from './components/projects/ProjectDetailView';
import { ConsultationFormModal } from './components/consultation/ConsultationFormModal';
import { CartDrawer } from './components/store/CartDrawer';
import { CheckoutModal } from './components/store/CheckoutModal';
import { ProductDetailModal } from './components/store/ProductDetailModal';
import { AuthModal } from './components/auth/AuthModal';
import { ClerkProvider } from '@clerk/clerk-react';
import { Product } from './types';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

function MainApp() {
  const { currentUser, isAuthenticated, isAuthLoading, authError, openAuthModal } = useAuth();
  const { loadError } = useApp();

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Modals state
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);

  const handleNavigate = (tab: string) => {
    setActiveProjectId(null);
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setCurrentTab('projects');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans text-stone-900 selection:bg-stone-900 selection:text-white">
      {/* 3-Zone Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenConsultationModal={() => setIsConsultationModalOpen(true)}
      />

      {(authError || loadError) && (
        <div role="alert" className="bg-red-50 border-b border-red-200 px-4 py-2 text-xs text-red-800 text-center">
          {authError || `Could not load data: ${loadError}`}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* If inside an active project view */}
        {activeProjectId ? (
          <ProjectDetailView
            projectId={activeProjectId}
            onBack={() => setActiveProjectId(null)}
          />
        ) : (
          <>
            {/* 1. Overview / Marketing */}
            {currentTab === 'home' && (
              <HomeView
                onOpenConsultationModal={() => setIsConsultationModalOpen(true)}
                onNavigate={handleNavigate}
                onSelectProduct={prod => setSelectedProductForModal(prod)}
              />
            )}

            {/* 2. Design Services */}
            {currentTab === 'services' && (
              <ServicesView
                onOpenConsultationModal={() => setIsConsultationModalOpen(true)}
              />
            )}

            {/* 3. Décor Store (Public) */}
            {currentTab === 'shop' && (
              <ShopView
                onSelectProduct={prod => setSelectedProductForModal(prod)}
              />
            )}

            {/* 4. Projects & Workspace (Protected by Auth & Role) */}
            {currentTab === 'projects' && (
              <div className="space-y-6">
                {isAuthLoading ? (
                  <p className="py-16 text-center text-xs text-stone-500">Loading your workspace...</p>
                ) : !isAuthenticated ? (
                  <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-stone-200 shadow-sm text-center space-y-4">
                    <div className="w-12 h-12 bg-stone-100 text-stone-900 rounded-2xl flex items-center justify-center mx-auto">
                      <Lock className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <h2 className="text-xl font-semibold text-stone-900 font-serif">
                      Sign In Required
                    </h2>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Please sign in to view your design consultation briefs, attended meetings, and active contractor project milestones.
                    </p>
                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        onClick={() => openAuthModal('signin')}
                        className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <span>Sign In to Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openAuthModal('signup')}
                        className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl cursor-pointer"
                      >
                        Create New Customer Account
                      </button>
                    </div>
                  </div>
                ) : (
                  <ErrorBoundary>
                    {currentUser?.role === 'designer' ? (
                      <DesignerDashboard onOpenProject={handleOpenProject} />
                    ) : currentUser?.role === 'contractor' ? (
                      <ContractorDashboard onOpenProject={handleOpenProject} />
                    ) : currentUser?.role === 'admin' ? (
                      <AdminDashboard />
                    ) : (
                      <CustomerDashboard
                        onOpenConsultationModal={() => setIsConsultationModalOpen(true)}
                        onOpenProject={handleOpenProject}
                        onNavigateToShop={() => handleNavigate('shop')}
                        onNavigateToOrders={() => handleNavigate('orders')}
                      />
                    )}
                  </ErrorBoundary>
                )}
              </div>
            )}

            {/* 5. Orders (Protected for Customers / Admin) */}
            {currentTab === 'orders' && (
              <div className="space-y-6">
                {isAuthLoading ? (
                  <p className="py-16 text-center text-xs text-stone-500">Loading your orders...</p>
                ) : !isAuthenticated ? (
                  <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-stone-200 shadow-sm text-center space-y-4">
                    <div className="w-12 h-12 bg-stone-100 text-stone-900 rounded-2xl flex items-center justify-center mx-auto">
                      <Lock className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <h2 className="text-xl font-semibold text-stone-900 font-serif">
                      Sign In to View Orders
                    </h2>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Please sign in with your customer account to view your past purchases, demo payment receipts, and delivery tracking.
                    </p>
                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        onClick={() => openAuthModal('signin')}
                        className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <OrdersView
                    onNavigateToShop={() => handleNavigate('shop')}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Architectural Clean Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenConsultationModal={() => setIsConsultationModalOpen(true)}
      />

      {/* Modals & Drawers */}
      <ConsultationFormModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        onSuccessNavigate={() => {
          setIsConsultationModalOpen(false);
          setCurrentTab('projects');
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => {
          if (!isAuthenticated) {
            openAuthModal('signin');
          } else {
            setIsCheckoutOpen(true);
          }
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderCompleted={order => {
          setIsCheckoutOpen(false);
          setCurrentTab('orders');
        }}
      />

      <ProductDetailModal
        product={selectedProductForModal}
        isOpen={!!selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Last so it opens on top of the consultation form */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
        <AuthProvider>
          <AppProvider>
            <MainApp />
          </AppProvider>
        </AuthProvider>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
