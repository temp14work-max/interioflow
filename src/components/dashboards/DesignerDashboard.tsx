/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/AuthContext';
import { useApp } from '../../lib/store/AppContext';
import { formatINR, formatDate } from '../../lib/utils/formatters';
import { DesignRequest, Proposal } from '../../types';
import { CreateProposalModal } from '../consultation/CreateProposalModal';
import { ProposalDetailModal } from '../consultation/ProposalDetailModal';
import { ScheduleMeetingModal } from '../consultation/ScheduleMeetingModal';
import {
  FileSpreadsheet,
  Plus,
  Clock,
  ArrowRight,
  User,
  Calendar,
  Video,
  CheckCircle,
} from 'lucide-react';

interface DesignerDashboardProps {
  onOpenProject: (projectId: string) => void;
}

export const DesignerDashboard: React.FC<DesignerDashboardProps> = ({ onOpenProject }) => {
  const { currentUser } = useAuth();
  const { requests, proposals, projects, assignDesigner } = useApp();

  const [selectedRequestForProposal, setSelectedRequestForProposal] = useState<DesignRequest | null>(null);
  const [selectedRequestForMeeting, setSelectedRequestForMeeting] = useState<DesignRequest | null>(null);
  const [selectedProposalToView, setSelectedProposalToView] = useState<Proposal | null>(null);

  // Designer sees assigned requests or unassigned requests
  const designerRequests = requests.filter(
    r => r.assigned_designer_id === currentUser?.id || !r.assigned_designer_id
  );
  const designerProjects = projects.filter(p => p.designer_id === currentUser?.id);
  const designerProposals = proposals.filter(p => p.designer_id === currentUser?.id);

  return (
    <div className="space-y-8">
      {/* Studio Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Designer Architecture Studio
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold text-stone-900 font-serif tracking-tight mt-1">
            Studio Portfolio: {currentUser?.display_name || 'Interior Designer'}
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-xl leading-relaxed">
            Review client consultation briefs, schedule concept meetings, issue formal proposals in paise, and coordinate contractor trade milestones.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
          <div>
            <span className="text-[10px] uppercase font-semibold text-stone-400 block tracking-wider">
              Active Projects
            </span>
            <span className="font-mono text-xl font-bold text-stone-900 tabular-nums">
              {designerProjects.length}
            </span>
          </div>
          <div className="h-8 w-px bg-stone-200" />
          <div>
            <span className="text-[10px] uppercase font-semibold text-stone-400 block tracking-wider">
              Pending Briefs
            </span>
            <span className="font-mono text-xl font-bold text-amber-800 tabular-nums">
              {designerRequests.filter(r => r.status === 'submitted' || r.status === 'under_review' || r.status === 'meeting_scheduled').length}
            </span>
          </div>
        </div>
      </div>

      {/* Consultation Review Queue */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-stone-900 font-serif">
            Client Consultation Queue & Briefs
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Coordinate with prospective clients, schedule meetings, and issue itemized quotations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {designerRequests.length === 0 ? (
            <div className="col-span-2 p-10 text-center bg-white rounded-2xl border border-dashed border-stone-200 text-stone-400 text-xs">
              No new consultation briefs currently waiting in the studio queue.
            </div>
          ) : (
            designerRequests.map(req => {
              const isAssignedToMe = req.assigned_designer_id === currentUser?.id;

              return (
                <div
                  key={req.id}
                  className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                      <span>{req.city || 'Studio Queue'} · {formatDate(req.created_at)}</span>
                      <span className="capitalize text-stone-700 font-medium">
                        {(req.project_type || 'residential').replace(/_/g, ' ')} · {req.area_sqft || 0} sq.ft
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-stone-900 font-serif">
                      {req.title || 'Client Brief'}
                    </h3>

                    <div className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      <span>Client: <strong className="text-stone-800">{req.customer_name || 'Client'}</strong> ({req.customer_email})</span>
                    </div>

                    <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed bg-stone-50/70 p-2.5 rounded-lg border border-stone-100">
                      {req.requirements || 'Architectural interior consultation requirements.'}
                    </p>

                    {/* Meeting status if scheduled */}
                    {req.meeting && (
                      <div className="mt-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-amber-700" />
                          Meeting: {formatDate(req.meeting.scheduled_date)} at {req.meeting.scheduled_time || 'Scheduled Time'}
                        </span>
                        {req.meeting.meeting_link && (
                          <a
                            href={req.meeting.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-bold underline"
                          >
                            Meet Link
                          </a>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(req.style_preferences || ['Scandinavian Minimal']).map(style => (
                        <span
                          key={style}
                          className="text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200"
                        >
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                        Client Budget
                      </span>
                      <span className="font-mono text-xs font-bold text-stone-900 tabular-nums">
                        {formatINR(req.budget_min_paise)} – {formatINR(req.budget_max_paise)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isAssignedToMe && (
                        <button
                          onClick={() => {
                            if (!currentUser) return;
                            assignDesigner(req.id, currentUser.id, currentUser.display_name).catch(err => window.alert(err.message));
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer"
                        >
                          Claim Brief
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedRequestForMeeting(req)}
                        className="px-3 py-1.5 text-xs font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5 text-stone-500" />
                        <span>Schedule Meeting</span>
                      </button>

                      <button
                        onClick={() => setSelectedRequestForProposal(req)}
                        className="px-3.5 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Issue Quotation</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Active Projects Managed by Designer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-900 font-serif">
            Live Projects Under Management
          </h2>
          <span className="text-xs text-stone-500">
            {designerProjects.length} active projects
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {designerProjects.length === 0 ? (
            <div className="col-span-2 p-8 text-center bg-white rounded-2xl border border-dashed border-stone-200 text-stone-400 text-xs">
              No projects under active execution. When a client accepts your proposal, the project automatically initializes here.
            </div>
          ) : (
            designerProjects.map(proj => (
              <div
                key={proj.id}
                onClick={() => onOpenProject(proj.id)}
                className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:border-stone-400 transition-all cursor-pointer space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                    <span>Client: {proj.customer_name}</span>
                    <span className="capitalize font-semibold text-amber-800">
                      {proj.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-stone-900 font-serif">
                    {proj.title}
                  </h3>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-500">Milestone Progress</span>
                    <span className="font-mono font-bold text-stone-900 tabular-nums">
                      {proj.progress_percent}%
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-stone-900 h-full rounded-full"
                      style={{ width: `${proj.progress_percent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-stone-900 tabular-nums">
                    Budget: {formatINR(proj.budget_paise)}
                  </span>
                  <span className="text-amber-800 font-medium hover:underline flex items-center gap-1">
                    Manage Milestones <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Proposals History */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-stone-900 font-serif">
          Quotation Proposals Issued
        </h2>

        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3">Proposal Title</th>
                  <th className="px-4 py-3">Linked Request</th>
                  <th className="px-4 py-3">Quotation (INR)</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Valid Until</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {designerProposals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-stone-400">
                      No proposals drafted yet.
                    </td>
                  </tr>
                ) : (
                  designerProposals.map(prop => (
                    <tr
                      key={prop.id}
                      onClick={() => setSelectedProposalToView(prop)}
                      className="hover:bg-stone-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3.5 font-medium text-stone-900">
                        {prop.title}
                      </td>
                      <td className="px-4 py-3.5 text-stone-600">
                        {prop.request_title}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold tabular-nums text-stone-900">
                        {formatINR(prop.price_paise)}
                      </td>
                      <td className="px-4 py-3.5 text-stone-600">
                        {prop.estimated_duration_weeks} Weeks
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                            prop.status === 'accepted'
                              ? 'bg-emerald-50 text-emerald-800'
                              : prop.status === 'sent'
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {prop.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-stone-400">
                        {formatDate(prop.valid_until)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Schedule Meeting */}
      {selectedRequestForMeeting && (
        <ScheduleMeetingModal
          request={selectedRequestForMeeting}
          isOpen={!!selectedRequestForMeeting}
          onClose={() => setSelectedRequestForMeeting(null)}
        />
      )}

      {/* Modal: Draft Proposal */}
      {selectedRequestForProposal && (
        <CreateProposalModal
          request={selectedRequestForProposal}
          isOpen={!!selectedRequestForProposal}
          onClose={() => setSelectedRequestForProposal(null)}
          onCreated={() => setSelectedRequestForProposal(null)}
        />
      )}

      {/* Modal: View Proposal Details */}
      {selectedProposalToView && (
        <ProposalDetailModal
          proposal={selectedProposalToView}
          isOpen={!!selectedProposalToView}
          onClose={() => setSelectedProposalToView(null)}
        />
      )}
    </div>
  );
};
