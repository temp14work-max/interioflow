/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../lib/store/AppContext';
import { ArchitecturalProjectShowcase } from '../../types';
import { formatINR } from '../../lib/utils/formatters';
import {
  Compass,
  Ruler,
  Clock,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
  Star,
  MapPin,
  Layers,
  ChevronRight,
  Maximize2,
} from 'lucide-react';

interface ProjectShowcaseSectionProps {
  onOpenConsultationModal: () => void;
}

export const ProjectShowcaseSection: React.FC<ProjectShowcaseSectionProps> = ({
  onOpenConsultationModal,
}) => {
  const { showcases } = useApp();
  const [selectedProject, setSelectedProject] = useState<ArchitecturalProjectShowcase | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  return (
    <section className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Real Executed Portfolio
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 font-serif mt-1">
            Featured Architectural Living Spaces
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
            Explore turnkey residences executed under InterioFlow’s unified designer scoping and verified contractor trade milestones.
          </p>
        </div>
        <div className="text-xs text-stone-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>100% Real Site Deliveries</span>
        </div>
      </div>

      {/* Grid of Real Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {showcases.map(project => (
          <div
            key={project.id}
            onClick={() => {
              setSelectedProject(project);
              setActiveGalleryIndex(0);
            }}
            className="group bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs hover:border-stone-400 hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer"
          >
            {/* Hero Image Container */}
            <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100">
              <img
                src={project.hero_image}
                alt={project.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
              
              {/* Category Badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-stone-900 text-[11px] font-semibold tracking-wide shadow-sm">
                  {project.category}
                </span>
              </div>

              {/* Location Badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-900/70 backdrop-blur-md text-stone-200 text-[11px]">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>{project.location}</span>
              </div>

              {/* Title & Specs Overlay */}
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <h3 className="text-xl font-semibold font-serif leading-snug group-hover:text-amber-200 transition-colors">
                  {project.title}
                </h3>
                <p className="text-xs text-stone-300 mt-1 line-clamp-1">
                  {project.subtitle}
                </p>

                <div className="pt-3 mt-3 border-t border-white/20 flex items-center justify-between text-xs text-stone-200">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Ruler className="w-3.5 h-3.5 text-stone-400" />
                      {project.carpet_area_sqft.toLocaleString()} sq.ft
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {project.duration_weeks} Weeks
                    </span>
                  </div>
                  <div className="font-mono font-bold text-amber-300 text-xs">
                    {formatINR(project.budget_paise)}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Card Footer with Thumbnails */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="flex items-center gap-2 overflow-hidden">
                {project.gallery_images.slice(0, 4).map((imgUrl, i) => (
                  <div
                    key={i}
                    className="relative w-16 h-12 rounded-lg overflow-hidden border border-stone-200 shrink-0"
                  >
                    <img
                      src={imgUrl}
                      alt={`${project.title} thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                <div className="text-[11px] text-stone-500 font-medium pl-1">
                  + More Views
                </div>
              </div>

              {/* Highlights tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {project.scope_highlights.slice(0, 2).map((highlight, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2.5 py-1 bg-stone-50 text-stone-700 rounded-md border border-stone-200/70 truncate max-w-[260px]"
                  >
                    {highlight}
                  </span>
                ))}
              </div>

              {/* Action Strip */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-500 text-[11px]">
                  Architect: <strong className="text-stone-800">{project.designer_name}</strong>
                </span>
                <span className="inline-flex items-center gap-1 text-stone-900 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>View Case Study</span>
                  <ChevronRight className="w-4 h-4 text-amber-800" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Case Study Full Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 flex flex-col">
            
            {/* Modal Close Button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 z-20 p-2 text-stone-600 hover:text-stone-900 bg-white/80 backdrop-blur-md rounded-full border border-stone-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Image Carousel / Main Display */}
            <div className="relative aspect-16/9 w-full bg-stone-950 overflow-hidden">
              <img
                src={selectedProject.gallery_images[activeGalleryIndex] || selectedProject.hero_image}
                alt={selectedProject.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent pointer-events-none" />

              {/* Details Overlay */}
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-medium">
                    {selectedProject.category}
                  </span>
                  <span className="text-stone-300 text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    {selectedProject.location}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-semibold font-serif">
                  {selectedProject.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl">
                  {selectedProject.subtitle}
                </p>
              </div>
            </div>

            {/* Gallery Selector Strip */}
            <div className="px-6 py-3 bg-stone-900 flex items-center gap-3 overflow-x-auto">
              {selectedProject.gallery_images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveGalleryIndex(idx)}
                  className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    activeGalleryIndex === idx
                      ? 'border-amber-400 scale-105'
                      : 'border-stone-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Modal Content Columns */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Quick Spec Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <div>
                  <span className="text-[11px] text-stone-500 uppercase font-semibold block">Carpet Area</span>
                  <span className="font-mono text-base font-bold text-stone-900">
                    {selectedProject.carpet_area_sqft.toLocaleString()} sq.ft
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 uppercase font-semibold block">Execution Period</span>
                  <span className="font-mono text-base font-bold text-stone-900">
                    {selectedProject.duration_weeks} Weeks
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 uppercase font-semibold block">Turnkey Budget</span>
                  <span className="font-mono text-base font-bold text-stone-900">
                    {formatINR(selectedProject.budget_paise)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 uppercase font-semibold block">Lead Architect</span>
                  <span className="text-xs font-semibold text-stone-900 truncate block mt-0.5">
                    {selectedProject.designer_name}
                  </span>
                </div>
              </div>

              {/* Scope & Materials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                    Architectural Scope Highlights
                  </h4>
                  <ul className="space-y-2">
                    {selectedProject.scope_highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-stone-700 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                    Bespoke Materials Palette
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.materials_used.map((mat, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-800 text-xs font-medium border border-stone-200"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>

                  {/* Client Testimonial */}
                  <div className="mt-5 p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-2">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(selectedProject.client_review.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs italic text-stone-700 leading-relaxed">
                      "{selectedProject.client_review.quote}"
                    </p>
                    <div className="text-[11px] font-semibold text-stone-900">
                      — {selectedProject.client_review.author}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-stone-500">
                  Ready to transform your apartment, villa, or workspace?
                </span>
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    onOpenConsultationModal();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <span>Request Scope for Your Property</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </section>
  );
};
