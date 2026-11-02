/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Compass,
  Ruler,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Building2,
  Home,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ProjectShowcaseSection } from '../projects/ProjectShowcaseSection';

interface ServicesViewProps {
  onOpenConsultationModal: () => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ onOpenConsultationModal }) => {
  const servicePackages = [
    {
      title: 'Full Residential Turnkey Design',
      category: 'Complete Living Transformation',
      desc: 'End-to-end architectural planning for apartments and villas. From initial measurement and demolition drawings to custom fluted millwork, lighting schedules, and contractor supervision.',
      icon: <Home className="w-6 h-6 text-stone-900" />,
      features: [
        'Detailed 3D daylight & spatial visualizations',
        'Bespoke carpentry and millwork shop drawings',
        'MEP electrical and plumbing distribution schematics',
        'Physical material swatch procurement (stone, timber, metal)',
        'Milestone-by-milestone contractor site inspection',
      ],
      idealFor: '3BHK & 4BHK Apartments, Penthouses & Independent Villas',
    },
    {
      title: 'Suite & Single Room Revamp',
      category: 'Targeted Focus',
      desc: 'Dedicated design restructuring for master bedrooms, modern kitchens, home libraries, or executive home offices with minimal disruption.',
      icon: <Layers className="w-6 h-6 text-stone-900" />,
      features: [
        'Photorealistic 3D render package (4 key perspectives)',
        'Built-in wardrobe & floating furniture joinery drawings',
        'Architectural cove & task lighting specifications',
        'Color palette, micro-cement & wallpaper selection',
      ],
      idealFor: 'Master Suites, Gourmet Kitchens & Home Studies',
    },
    {
      title: 'Commercial & Creative Workspaces',
      category: 'Commercial Interiors',
      desc: 'Purpose-built layouts optimizing acoustic privacy, natural illumination, ergonomic collaboration zones, and distinct brand identity.',
      icon: <Building2 className="w-6 h-6 text-stone-900" />,
      features: [
        'High-density spatial flow and circulation blueprints',
        'Acoustic felt baffling and ceiling channel layouts',
        'Commercial code compliance & electrical load plans',
        'Reception, meeting pods & breakout area designs',
      ],
      idealFor: 'Design Studios, Boutique Law Offices & Tech Startups',
    },
    {
      title: 'Full Renovation & Remodel',
      category: 'Restoration & Modernization',
      desc: 'Breathing new life into older properties through structural wall adjustments, modern concealed plumbing, subfloor levelling, and upgraded electrical circuits.',
      icon: <Ruler className="w-6 h-6 text-stone-900" />,
      features: [
        'Structural assessment and demolition guides',
        'Waterproofing and tile relaying specifications',
        'Complete rewiring for smart lighting channels',
        'Window glazing and acoustic insulation upgrades',
      ],
      idealFor: '10+ Year Old Apartments & Heritage Bungalows',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      
      {/* Services Hero */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
          Architectural Capabilities
        </span>
        <h1 className="text-3xl sm:text-5xl font-semibold text-stone-900 font-serif tracking-tight">
          Comprehensive Interior Design Consulting Packages
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Every project is tailored with architectural precision, itemized budgets in paise, and rigorous trade milestones executed by certified contractors.
        </p>
      </div>

      {/* Service Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {servicePackages.map((pkg, idx) => (
          <div
            key={idx}
            className="bg-white p-7 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-6 hover:border-stone-400 transition-colors"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-stone-100 rounded-2xl">
                  {pkg.icon}
                </div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                  {pkg.category}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-stone-900 font-serif">
                  {pkg.title}
                </h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  {pkg.desc}
                </p>
              </div>

              {/* Feature Checklist */}
              <div className="pt-2 space-y-2 border-t border-stone-100">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Included Deliverables:
                </span>
                {pkg.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2 text-xs text-stone-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500 font-medium truncate max-w-[200px]">
                {pkg.idealFor}
              </span>
              <button
                onClick={onOpenConsultationModal}
                className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
              >
                <span>Request Scope</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Real Executed Portfolio Section */}
      <ProjectShowcaseSection onOpenConsultationModal={onOpenConsultationModal} />

      {/* How It Works Detail Section */}
      <div className="bg-stone-900 text-stone-200 p-8 sm:p-12 rounded-3xl space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-mono tracking-wider text-amber-500 uppercase">
            Execution Standards
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold font-serif text-white">
            The InterioFlow Architectural Guarantee
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
            We bridge the historic friction between creative designers, homeowner expectations, and trade contractors with transparent digital milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-stone-800">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-white">1. Fixed-Price Quotations</div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Every proposal itemizes materials, hours, and contractor fees upfront in integer paise. No surprise invoices halfway through demolition.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-semibold text-white">2. Trade Verification</div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Electrical, carpentry, and limewash painting milestones must be marked complete by assigned contractors and audited by your lead designer.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-semibold text-white">3. Role Security</div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Your property details, drawings, and quotation records are shielded by PostgreSQL Row Level Security; contractors only see their assigned work.
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-start">
          <button
            onClick={onOpenConsultationModal}
            className="px-5 py-2.5 bg-white text-stone-900 hover:bg-stone-100 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Start Your Consultation Today
          </button>
        </div>
      </div>

    </div>
  );
};
