/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DesignRequest } from '../../types';
import { useAuth } from '../../lib/auth/AuthContext';
import { useApp } from '../../lib/store/AppContext';
import { formatINR } from '../../lib/utils/formatters';
import { ProposalSchema } from '../../lib/validation/schemas';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';

interface CreateProposalModalProps {
  request: DesignRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export const CreateProposalModal: React.FC<CreateProposalModalProps> = ({
  request,
  isOpen,
  onClose,
  onCreated,
}) => {
  const { currentUser } = useAuth();
  const { createProposal } = useApp();

  const [title, setTitle] = useState('');
  const [scope, setScope] = useState('');
  const [deliverables, setDeliverables] = useState<string[]>([
    'Detailed 3D architectural renders with daylight study',
    'Custom carpentry & fluted panel shop drawings',
    'Complete electrical wiring and switch schedule',
  ]);
  const [newDeliverable, setNewDeliverable] = useState('');
  const [priceRupees, setPriceRupees] = useState<number>(request ? Math.round(request.budget_min_paise / 100) : 500000);
  const [durationWeeks, setDurationWeeks] = useState<number>(8);
  const [validDays, setValidDays] = useState<number>(30);
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const handleAddDeliverable = () => {
    if (newDeliverable.trim()) {
      setDeliverables([...deliverables, newDeliverable.trim()]);
      setNewDeliverable('');
    }
  };

  const handleRemoveDeliverable = (idx: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const pricePaise = Math.round(Number(priceRupees) * 100);

    const validation = ProposalSchema.safeParse({
      design_request_id: request.id,
      title: title || `Design Scope for ${request.title}`,
      scope,
      deliverables,
      price_paise: pricePaise,
      estimated_duration_weeks: Number(durationWeeks),
      valid_until_days: Number(validDays),
      notes,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach(err => {
        fieldErrors[err.path.join('.')] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + validDays);

    try {
      await createProposal({
        design_request_id: request.id,
        request_title: request.title,
        designer_id: currentUser!.id,
        designer_name: currentUser!.display_name,
        title: title || `Interior Design Proposal for ${request.title}`,
        scope,
        deliverables,
        price_paise: pricePaise,
        estimated_duration_weeks: Number(durationWeeks),
        valid_until: validUntilDate.toISOString(),
        notes,
      });

      onClose();
      if (onCreated) onCreated();
    } catch (err: any) {
      setErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 bg-stone-50/70">
          <div>
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">
              Designer Workspace
            </span>
            <h3 className="text-lg font-semibold text-stone-900 font-serif">
              Formulate Scope & Quotation
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Drafting proposal for: <strong className="text-stone-800">{request.title}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {Object.keys(errors).length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Please correct the following:</div>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  {Object.values(errors).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Client Budget Reference Banner */}
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
            <span>Customer Budget Window:</span>
            <span className="font-mono font-semibold text-stone-900">
              {formatINR(request.budget_min_paise)} – {formatINR(request.budget_max_paise)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Proposal Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={`e.g. Turnkey Architectural Concept: ${request.title}`}
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Scope of Work & Architectural Strategy *
            </label>
            <textarea
              value={scope}
              onChange={e => setScope(e.target.value)}
              rows={3}
              placeholder="Detail the spatial restructuring, acoustic treatment, finish schedules, and milestone coordination..."
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900"
              required
            />
          </div>

          {/* Deliverables List */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Key Deliverables & Shop Drawings *
            </label>
            <div className="space-y-2 mb-2">
              {deliverables.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-stone-50 px-3 py-2 rounded-lg border border-stone-200">
                  <span className="text-stone-800">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDeliverable(idx)}
                    className="text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newDeliverable}
                onChange={e => setNewDeliverable(e.target.value)}
                placeholder="Add another deliverable (e.g. MEP schedule, material boards)..."
                className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden text-stone-900"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDeliverable();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddDeliverable}
                className="px-3 py-1.5 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg border border-stone-200 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Pricing in INR & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Quotation Price (₹ INR) *
              </label>
              <input
                type="number"
                value={priceRupees}
                onChange={e => setPriceRupees(Number(e.target.value))}
                step={10000}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Duration (Weeks) *
              </label>
              <input
                type="number"
                value={durationWeeks}
                onChange={e => setDurationWeeks(Number(e.target.value))}
                min={1}
                max={52}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Validity (Days)
              </label>
              <input
                type="number"
                value={validDays}
                onChange={e => setValidDays(Number(e.target.value))}
                min={7}
                max={90}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Designer Notes / Terms
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Price includes two rounds of revision and weekly site inspection."
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              {isSubmitting ? 'Sending Proposal...' : 'Issue Official Proposal'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
