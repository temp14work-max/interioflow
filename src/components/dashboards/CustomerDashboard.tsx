/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/AuthContext';
import { useApp } from '../../lib/store/AppContext';
import { formatINR, formatDate } from '../../lib/utils/formatters';
import { Proposal } from '../../types';
import { ProposalDetailModal } from '../consultation/ProposalDetailModal';
import {
  FileText,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
  Video,
  MapPin,
  CheckCircle2,
  Compass,
  Layers,
} from 'lucide-react';

interface CustomerDashboardProps {
  onOpenConsultationModal: () => void;
  onOpenProject: (projectId: string) => void;
  onNavigateToShop: () => void;
  onNavigateToOrders: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onOpenConsultationModal,
  onOpenProject,
  onNavigateToShop,
  onNavigateToOrders,
}) => {
  const { currentUser } = useAuth();
  const { requests, proposals, projects, orders } = useApp();

  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  const currentId = currentUser?.id;

  const customerRequests = requests.filter(r => r.customer_id === currentId);

  const customerProjects = projects.filter(p => p.customer_id === currentId);

  const customerProposals = proposals.filter(p =>
    customerRequests.some(r => r.id === p.design_request_id) ||
    customerProjects.some(proj => proj.proposal_id === p.id)
  );

  const customerOrders = orders.filter(o => o.customer_id === currentId);

  const pendingProposals = customerProposals.filter(p => p.status === 'sent');
  const scheduledMeetings = customerRequests.filter(r => r.status === 'meeting_scheduled' && r.meeting);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Homeowner Project Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold text-stone-900 font-serif tracking-tight mt-1">
            Welcome, {currentUser?.display_name || 'Homeowner'}
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-xl leading-relaxed">
            Track your interior design consultations, attend concept meetings, review binding quotations, and follow contractor milestone execution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenConsultationModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Request Design Consultation</span>
          </button>
          <button
            onClick={onNavigateToShop}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200/80 rounded-xl border border-stone-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>Browse Décor Store</span>
          </button>
        </div>
      </div>

      {/* Real-Life Workflow Progression Stages */}
      {/* CASE 1: Brand New Customer (No requests yet) */}
      {customerRequests.length === 0 && customerProjects.length === 0 && (
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-stone-200/80 shadow-xs space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-900 flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7 stroke-[1.5]" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-semibold text-stone-900 font-serif">
              Begin Your Interior Design Journey
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              You do not have any active projects yet. Submit your room requirements and floor area to schedule a consultation with an architect.
            </p>
          </div>

          {/* Step Progression Diagram */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4 text-left">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] font-bold text-amber-700 block">STEP 1</span>
              <div className="text-xs font-semibold text-stone-900 mt-1">Submit Brief</div>
              <p className="text-[11px] text-stone-500 mt-0.5">Area, budget & preferred aesthetic.</p>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] font-bold text-amber-700 block">STEP 2</span>
              <div className="text-xs font-semibold text-stone-900 mt-1">Designer Meeting</div>
              <p className="text-[11px] text-stone-500 mt-0.5">Virtual meet or on-site walk-through.</p>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] font-bold text-amber-700 block">STEP 3</span>
              <div className="text-xs font-semibold text-stone-900 mt-1">Quotation Sign-Off</div>
              <p className="text-[11px] text-stone-500 mt-0.5">Review 3D scope & price in paise.</p>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] font-bold text-amber-700 block">STEP 4</span>
              <div className="text-xs font-semibold text-stone-900 mt-1">Live Project Workspace</div>
              <p className="text-[11px] text-stone-500 mt-0.5">Track contractor trade milestones.</p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenConsultationModal}
              className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium inline-flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
            >
              <span>Submit Initial Consultation Brief</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* CASE 2: Scheduled Meeting Notice */}
      {scheduledMeetings.length > 0 && (
        <div className="p-5 bg-amber-50/90 border border-amber-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-amber-700" />
            <span>Upcoming Design Consultation Scheduled</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scheduledMeetings.map(req => {
              const meeting = req.meeting;
              return (
                <div
                  key={req.id}
                  className="bg-white p-5 rounded-xl border border-amber-200/80 shadow-xs space-y-3"
                >
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                      Project: {req.title || 'Design Consultation'}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-stone-800 font-medium mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        {formatDate(meeting?.scheduled_date)}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        {meeting?.scheduled_time || 'Scheduled Time'}
                      </span>
                    </div>
                  </div>

                  {meeting?.mode === 'virtual' ? (
                    <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-stone-700">
                        <Video className="w-4 h-4 text-amber-700" />
                        <span>Google Meet Virtual Session</span>
                      </div>
                      {meeting.meeting_link && (
                        <a
                          href={meeting.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-stone-900 underline hover:text-amber-800"
                        >
                          Join Call →
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs flex items-center gap-2 text-stone-700">
                      <MapPin className="w-4 h-4 text-amber-700" />
                      <span>In-Person Site Visit: {meeting?.location_address || req.city || 'Client Site'}</span>
                    </div>
                  )}

                  {meeting?.designer_notes && (
                    <p className="text-[11px] text-stone-500 italic">
                      Agenda: {meeting.designer_notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CASE 3: Pending Designer Proposals (Action Required) */}
      {pendingProposals.length > 0 && (
        <div className="p-5 bg-stone-900 text-white rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-300 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Formal Design Scope & Quotations Ready for Review</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingProposals.map(prop => (
              <div
                key={prop.id}
                className="bg-stone-800 p-5 rounded-xl border border-stone-700 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="text-[11px] text-stone-400">
                    From {prop.designer_name || 'Lead Architect'} · Valid until {formatDate(prop.valid_until)}
                  </div>
                  <h4 className="text-base font-semibold text-white mt-1">
                    {prop.title || 'Architectural Design Proposal'}
                  </h4>
                  <p className="text-xs text-stone-300 line-clamp-2 mt-1 leading-relaxed">
                    {prop.scope || 'Comprehensive turnkey interior design deliverables and site management.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-700 flex items-center justify-between">
                  <div className="font-mono text-base font-bold text-emerald-400 tabular-nums">
                    {formatINR(prop.price_paise)}
                  </div>
                  <button
                    onClick={() => setSelectedProposal(prop)}
                    className="px-4 py-2 text-xs font-medium text-stone-900 bg-white hover:bg-stone-100 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    <span>Inspect Scope & Sign Off</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CASE 4: Active Projects Under Execution */}
      {customerProjects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-stone-900 font-serif">
                Active Projects Under Execution
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Approved projects provisioned with contractor trade milestones.
              </p>
            </div>
            <span className="text-xs text-stone-500">
              {customerProjects.length} active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {customerProjects.map(proj => {
              const statusLabel = (proj.status || 'planned').replace(/_/g, ' ');
              const progressVal = typeof proj.progress_percent === 'number' ? proj.progress_percent : 0;
              return (
                <div
                  key={proj.id}
                  onClick={() => onOpenProject(proj.id)}
                  className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:border-stone-400 hover:shadow-md transition-all cursor-pointer space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                      <span>Target Handover: {formatDate(proj.target_end_date)}</span>
                      <span className="capitalize font-semibold text-amber-800">
                        {statusLabel}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-stone-900 font-serif">
                      {proj.title || 'Turnkey Interior Project'}
                    </h3>
                    <div className="text-xs text-stone-500 mt-1">
                      Lead Architect: <strong className="text-stone-700">{proj.designer_name || 'Design Lead'}</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-stone-100">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-500">Milestone Progress</span>
                      <span className="font-mono font-bold text-stone-900 tabular-nums">
                        {progressVal}%
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-stone-900 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressVal}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs border-t border-stone-100">
                    <span className="font-mono font-bold text-stone-900 tabular-nums">
                      Budget: {formatINR(proj.budget_paise)}
                    </span>
                    <span className="text-amber-800 font-medium hover:underline flex items-center gap-1">
                      Open Project Workspace <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Consultation Requests History */}
      {customerRequests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-stone-900 font-serif">
            My Registered Consultation Briefs
          </h2>

          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3">Project Title</th>
                    <th className="px-4 py-3">Property & Area</th>
                    <th className="px-4 py-3">Budget Window</th>
                    <th className="px-4 py-3">Assigned Architect</th>
                    <th className="px-4 py-3">Current Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {customerRequests.map(req => {
                    const projectTypeStr = (req.project_type || 'residential').replace(/_/g, ' ');
                    const statusStr = (req.status || 'submitted').replace(/_/g, ' ');
                    return (
                      <tr key={req.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-stone-900">
                          {req.title || 'Consultation Brief'}
                        </td>
                        <td className="px-4 py-3.5 capitalize text-stone-600">
                          {projectTypeStr} · {req.area_sqft || 0} sq.ft
                        </td>
                        <td className="px-4 py-3.5 font-mono tabular-nums text-stone-800">
                          {formatINR(req.budget_min_paise)} – {formatINR(req.budget_max_paise)}
                        </td>
                        <td className="px-4 py-3.5 text-stone-600">
                          {req.assigned_designer_name || 'Under Review / Studio Queue'}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                              req.status === 'accepted'
                                ? 'bg-emerald-50 text-emerald-800'
                                : req.status === 'meeting_scheduled'
                                ? 'bg-amber-100 text-amber-900 font-semibold'
                                : req.status === 'proposal_sent'
                                ? 'bg-amber-50 text-amber-800'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {statusStr}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-stone-400">
                          {formatDate(req.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Proposal Review Modal */}
      {selectedProposal && (
        <ProposalDetailModal
          proposal={selectedProposal}
          isOpen={!!selectedProposal}
          onClose={() => setSelectedProposal(null)}
          onProjectCreated={projectId => {
            setSelectedProposal(null);
            onOpenProject(projectId);
          }}
        />
      )}
    </div>
  );
};
