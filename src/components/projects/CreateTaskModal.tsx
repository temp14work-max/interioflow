/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/AuthContext';
import { useApp } from '../../lib/store/AppContext';
import { CreateTaskSchema } from '../../lib/validation/schemas';
import { X, AlertCircle } from 'lucide-react';

interface CreateTaskModalProps {
  projectId: string;
  projectTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  projectId,
  projectTitle,
  isOpen,
  onClose,
}) => {
  const { users, currentUser } = useAuth();
  const { createTask, addProjectUpdate } = useApp();

  const contractors = users.filter(u => u.role === 'contractor');
  const [contractorId, setContractorId] = useState(contractors[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'electrical' | 'carpentry' | 'painting' | 'flooring' | 'plumbing' | 'general'>('carpentry');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = CreateTaskSchema.safeParse({
      project_id: projectId,
      assigned_contractor_id: contractorId,
      title,
      description,
      category,
      due_date: dueDate,
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
    const assignedContractor = users.find(u => u.id === contractorId);

    try {
      await createTask({
        project_id: projectId,
        project_title: projectTitle,
        assigned_contractor_id: contractorId,
        assigned_contractor_name: assignedContractor ? assignedContractor.display_name : 'Master Contractor',
        title,
        description,
        category,
        status: 'todo',
        due_date: dueDate,
        created_by: currentUser!.id,
      });

      await addProjectUpdate(
        projectId,
        `New task assigned: "${title}" to ${assignedContractor?.display_name || 'Contractor'} (Due ${dueDate}).`
      );

      onClose();
    } catch (err: any) {
      setErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 bg-stone-50/70">
          <div>
            <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              Work Breakdown
            </div>
            <h3 className="text-base font-semibold text-stone-900 font-serif mt-0.5">
              Assign New Contractor Milestone
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {Object.keys(errors).length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <ul className="list-disc list-inside space-y-0.5">
                  {Object.values(errors).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Rough electrical chasing and switchboards"
              className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Trade Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden text-stone-900"
              >
                <option value="electrical">Electrical & Lighting</option>
                <option value="carpentry">Carpentry & Millwork</option>
                <option value="painting">Painting & Plaster</option>
                <option value="flooring">Flooring & Tiling</option>
                <option value="plumbing">Plumbing & Sanitary</option>
                <option value="general">General / Site Prep</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Assign Contractor *
              </label>
              <select
                value={contractorId}
                onChange={e => setContractorId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden text-stone-900"
                required
              >
                {contractors.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.display_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Target Completion Due Date *
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden text-stone-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Technical Description & Drawing Notes *
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Specify requirements, tolerances, material specs, or reference drawing sheets..."
              className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden text-stone-900"
              required
            />
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              {isSubmitting ? 'Assigning...' : 'Assign Milestone Task'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
