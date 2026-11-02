/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Proposal } from '../../types';
import { useAuth } from '../../lib/auth/AuthContext';
import { useApp } from '../../lib/store/AppContext';
import { formatINR, formatDate } from '../../lib/utils/formatters';
import { X, CheckCircle, Clock, ShieldCheck, FileCheck, ArrowRight } from 'lucide-react';

interface ProposalDetailModalProps {
  proposal: Proposal | null;
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: (projectId: string) => void;
}

export const ProposalDetailModal: React.FC<ProposalDetailModalProps> = ({
  proposal,
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const { currentUser } = useAuth();
  const { acceptProposal, rejectProposal } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionDone, setActionDone] = useState<'accepted' | 'rejected' | null>(null);

  if (!isOpen || !proposal) return null;

  const isCustomer = currentUser?.role === 'customer' || currentUser?.role === 'admin';
  const isPending = proposal.status === 'sent';

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      const project = await acceptProposal(proposal.id);
      setIsProcessing(false);
      setActionDone('accepted');
      if (onProjectCreated) {
        setTimeout(() => {
          onClose();
          onProjectCreated(project.id);
        }, 1200);
      }
    } catch (err: any) {
      setIsProcessing(false);
      window.alert(err.message);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await rejectProposal(proposal.id);
      setActionDone('rejected');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      window.alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 bg-stone-50/70">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <span>Proposal Revision #{proposal.revision}</span>
              <span aria-hidden="true">·</span>
              <span>Valid until {formatDate(proposal.valid_until)}</span>
            </div>
            <h3 className="text-lg font-semibold text-stone-900 font-serif">
              {proposal.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {actionDone === 'accepted' ? (
            <div className="p-8 text-center space-y-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold text-stone-900 font-serif">
                Proposal Accepted!
              </h4>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                Your interior design project has been initialized. Milestones and contractor task tracking are now active in the Project Workspace.
              </p>
            </div>
          ) : actionDone === 'rejected' ? (
            <div className="p-8 text-center space-y-3 bg-stone-50 rounded-xl border border-stone-200">
              <h4 className="text-lg font-semibold text-stone-900 font-serif">
                Proposal Marked as Declined
              </h4>
              <p className="text-xs text-stone-600">
                The designer has been notified to discuss adjustments or formulate a revised scope.
              </p>
            </div>
          ) : (
            <>
              {/* Quotation & Timeline Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200/80">
                <div>
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                    Total Quotation
                  </span>
                  <span className="text-xl font-bold font-mono text-stone-900 tabular-nums">
                    {formatINR(proposal.price_paise)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                    Estimated Duration
                  </span>
                  <span className="text-sm font-semibold text-stone-800 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-4 h-4 text-stone-500" />
                    {proposal.estimated_duration_weeks} Weeks Turnkey
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                    Lead Designer
                  </span>
                  <span className="text-sm font-semibold text-stone-800 flex items-center gap-1.5 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    {proposal.designer_name}
                  </span>
                </div>
              </div>

              {/* Scope */}
              <div>
                <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                  Scope of Work
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed bg-stone-50/50 p-3.5 rounded-lg border border-stone-100">
                  {proposal.scope}
                </p>
              </div>

              {/* Deliverables */}
              <div>
                <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                  Specified Deliverables & Drawings
                </h4>
                <div className="space-y-2">
                  {(proposal.deliverables || [
                    'Architectural Floorplans & Dimensioned Electrical Schedules',
                    'High-Resolution 3D Photorealistic Perspectives & Material Swatches',
                    'Itemized Bill of Quantities (BOQ) with Transparent Pricing in Paise',
                    'Contractor Trade Milestone Deliverables & Site Supervisions',
                  ]).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-800">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes if present */}
              {proposal.notes && (
                <div className="text-xs text-stone-500 border-l-2 border-stone-300 pl-3 italic">
                  Note: {proposal.notes}
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer Actions */}
        {!actionDone && (
          <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between">
            <div className="text-xs text-stone-500">
              Status: <span className="font-semibold capitalize text-stone-800">{proposal.status}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
              >
                Close
              </button>

              {isCustomer && isPending && (
                <>
                  <button
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="px-3.5 py-2 text-xs font-medium text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Decline Scope
                  </button>
                  <button
                    onClick={handleAccept}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Accept & Provision Project</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
