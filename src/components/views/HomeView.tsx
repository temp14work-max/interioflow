/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../lib/store/AppContext';
import { formatINR } from '../../lib/utils/formatters';
import { ProductCard } from '../store/ProductCard';
import { ProjectShowcaseSection } from '../projects/ProjectShowcaseSection';
import { Product } from '../../types';
import {
  ArrowRight,
  Compass,
  FileText,
  Hammer,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface HomeViewProps {
  onOpenConsultationModal: () => void;
  onNavigate: (tab: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenConsultationModal,
  onNavigate,
  onSelectProduct,
}) => {
  const { products, projects } = useApp();

  const featuredProducts = products.filter(p => p.featured || p.is_active).slice(0, 3);

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          {/* Subtle Tagline */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-medium border border-stone-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Consulting · Project Management · Direct Décor</span>
          </div>

          {/* Headline with No Orphan Words */}
          <h1 className="text-4xl sm:text-6xl font-semibold font-serif text-stone-900 tracking-tight leading-[1.12] text-balance">
            Where bespoke interior design meets milestone-driven execution.
          </h1>

          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            InterioFlow unifies homeowner design briefs, formal scope quotations, and on-site contractor milestone tracking in one transparent architectural platform.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenConsultationModal}
              className="w-full sm:w-auto px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <span>Request Consultation Brief</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('projects')}
              className="w-full sm:w-auto px-6 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl text-xs font-semibold border border-stone-200 transition-colors cursor-pointer"
            >
              View Active Projects & Milestones
            </button>
          </div>

          {/* Trust Metadata Strip */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Itemized Quotations in Paise
            </span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Contractor Trade Sign-Offs
            </span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              PostgreSQL Row Level Security
            </span>
          </div>

        </div>
      </section>

      {/* 3-Step Lifecycle Workflow (Primary Platform Function) */}
      <section className="bg-stone-100/70 p-8 sm:p-12 rounded-3xl border border-stone-200/80">
        <div className="max-w-2xl mx-auto text-center space-y-2 mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Structured Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 font-serif">
            From Initial Brief to Verified Handover
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Eliminating fragmented communication across WhatsApp, spreadsheets, and delayed invoices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-serif text-lg font-bold mb-4">
                01
              </div>
              <h3 className="text-base font-semibold text-stone-900 font-serif">
                Consultation & Specifications
              </h3>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Homeowners submit room floor areas, estimated budget limits in INR, and aesthetic preferences (Japandi, Warm Architectural, Minimalist).
              </p>
            </div>
            <div className="text-[11px] text-stone-400 border-t border-stone-100 pt-3">
              Role: Customer Brief
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-900 flex items-center justify-center font-serif text-lg font-bold mb-4">
                02
              </div>
              <h3 className="text-base font-semibold text-stone-900 font-serif">
                Architectural Proposal & Scope
              </h3>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Assigned interior designers craft turnkey deliverables, 3D render schedules, and binding price quotes. Customers review and approve.
              </p>
            </div>
            <div className="text-[11px] text-stone-400 border-t border-stone-100 pt-3">
              Role: Lead Designer Quotation
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-serif text-lg font-bold mb-4">
                03
              </div>
              <h3 className="text-base font-semibold text-stone-900 font-serif">
                Contractor Milestones & Sign-Off
              </h3>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Accepted proposals auto-provision an active project. Carpentry, electrical, and painting trades are assigned to contractors with live progress sliders.
              </p>
            </div>
            <div className="text-[11px] text-stone-400 border-t border-stone-100 pt-3">
              Role: Trade Contractors
            </div>
          </div>

        </div>
      </section>

      {/* Featured Architectural Projects Portfolio */}
      <ProjectShowcaseSection onOpenConsultationModal={onOpenConsultationModal} />

      {/* Featured Curated Décor Store Module */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Direct-to-Consumer Store
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 font-serif mt-1">
              Curated Architectural Décor
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Complementary lighting, sculptural seating, and organic textiles designed to complete your space.
            </p>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-900 hover:text-amber-800 transition-colors cursor-pointer"
          >
            <span>Explore All Products</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map(prod => (
            <ProductCard
              key={prod.id}
              product={prod}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* Architecture & Security Commitment Banner */}
      <section className="bg-stone-900 text-white p-8 sm:p-12 rounded-3xl relative overflow-hidden">
        <div className="max-w-2xl space-y-4 relative z-10">
          <span className="text-xs font-mono tracking-wider text-stone-400 uppercase">
            Platform Security & Technical Foundation
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold font-serif text-white">
            Engineered for security, privacy, and financial rigor.
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Built with strict role isolation between clients, designers, and trade contractors. Monetary values are stored in integer paise, and store checkout currently runs on demo payments.
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs text-stone-400">
            <span>Clerk Identity</span>
            <span>·</span>
            <span>Supabase RLS</span>
            <span>·</span>
            <span>Demo Payments</span>
          </div>
        </div>
      </section>

    </div>
  );
};
