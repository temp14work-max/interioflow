/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenConsultationModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenConsultationModal }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-900 flex items-center justify-center font-serif text-lg font-bold">
                I
              </div>
              <span className="text-xl font-semibold tracking-tight text-stone-100 font-serif">
                InterioFlow
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Connecting homeowners, architects, and master contractors through a structured interior consulting and milestone tracking ecosystem.
            </p>
          </div>

          {/* Workflow Col */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
              Design Workflow
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <button onClick={onOpenConsultationModal} className="hover:text-white transition-colors cursor-pointer">
                  Request Consultation
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-white transition-colors cursor-pointer">
                  Full Service Packages
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('projects')} className="hover:text-white transition-colors cursor-pointer">
                  Live Project Workspace
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('projects')} className="hover:text-white transition-colors cursor-pointer">
                  Contractor Milestones
                </button>
              </li>
            </ul>
          </div>

          {/* Décor Store Col */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
              Home Décor Store
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors cursor-pointer">
                  Architectural Lighting
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors cursor-pointer">
                  Sculptural Furniture
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors cursor-pointer">
                  Hand-Tufted Wool Rugs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors cursor-pointer">
                  Textiles & Accessories
                </button>
              </li>
            </ul>
          </div>

          {/* Security & Platform Trust */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
              Security & Trust
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Protected by PostgreSQL Row Level Security (RLS) and Clerk authentication. Store checkout currently runs on demo payments: no money is charged.
            </p>
            <div className="mt-4 text-[11px] text-stone-500">
              Primary product: Consulting & Project Tracking<br />
              Complementary module: Décor Store
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} InterioFlow Technologies. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Customer</span>
            <span aria-hidden="true">·</span>
            <span>Interior Designer</span>
            <span aria-hidden="true">·</span>
            <span>Contractor</span>
            <span aria-hidden="true">·</span>
            <span>Admin</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
