/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/AuthContext';
import { useApp } from '../../lib/store/AppContext';
import { Task, TaskStatus } from '../../types';
import { formatDate } from '../../lib/utils/formatters';
import { X, CheckCircle2, Clock, AlertTriangle, ListTodo, Camera } from 'lucide-react';

interface TaskUpdateModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenGallery?: (task: Task) => void;
}

export const TaskUpdateModal: React.FC<TaskUpdateModalProps> = ({
  task,
  isOpen,
  onClose,
  onOpenGallery,
}) => {
  const { currentUser } = useAuth();
  const { updateTaskProgress, addProjectUpdate } = useApp();

  const [status, setStatus] = useState<TaskStatus>(task ? task.status : 'todo');
  const [progressPercent, setProgressPercent] = useState<number>(task ? task.progress_percent : 0);
  const [notes, setNotes] = useState(task?.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if task changes
  React.useEffect(() => {
    if (task) {
      setStatus(task.status);
      setProgressPercent(task.progress_percent);
      setNotes(task.notes || '');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    let finalProgress = progressPercent;
    if (status === 'completed') finalProgress = 100;
    if (status === 'todo' && finalProgress === 100) finalProgress = 0;

    try {
      await updateTaskProgress(task.id, status, finalProgress, notes);

      // Also publish timeline note
      const updateMsg = `${currentUser?.display_name || 'Contractor'} (${currentUser?.role || 'trade'}) updated task "${task.title}" to ${status.toUpperCase()} (${finalProgress}% complete).${
        notes ? ` Note: ${notes}` : ''
      }`;
      await addProjectUpdate(task.project_id, updateMsg);
      onClose();
    } catch (err: any) {
      window.alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const statusOptions: { value: TaskStatus; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'todo', label: 'To Do', icon: <ListTodo className="w-3.5 h-3.5" />, color: 'bg-stone-100 text-stone-700' },
    { value: 'in_progress', label: 'In Progress', icon: <Clock className="w-3.5 h-3.5" />, color: 'bg-amber-100 text-amber-800' },
    { value: 'blocked', label: 'Blocked / Delayed', icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'bg-red-100 text-red-800' },
    { value: 'completed', label: 'Completed', icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'bg-emerald-100 text-emerald-800' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 bg-stone-50/70">
          <div>
            <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              Contractor Milestone Update
            </div>
            <h3 className="text-base font-semibold text-stone-900 font-serif mt-0.5">
              {task.title}
            </h3>
            <div className="text-xs text-stone-500 mt-1">
              Category: <span className="capitalize font-medium text-stone-700">{task.category}</span> · Due {formatDate(task.due_date)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Current Task Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map(opt => {
                const isSelected = status === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => {
                      setStatus(opt.value);
                      if (opt.value === 'completed') setProgressPercent(100);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Progress Percentage
              </label>
              <span className="font-mono text-xs font-bold text-stone-900 tabular-nums">
                {progressPercent}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progressPercent}
              onChange={e => {
                const val = Number(e.target.value);
                setProgressPercent(val);
                if (val === 100) setStatus('completed');
                else if (val > 0 && status === 'todo') setStatus('in_progress');
              }}
              className="w-full accent-stone-900 h-2 bg-stone-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1">
              <span>0% (Not Started)</span>
              <span>50% (In Flight)</span>
              <span>100% (Signed Off)</span>
            </div>
          </div>

          {/* Notes & Field Observations */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Field Observations & Handover Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Substrate primed; first coat of limewash drying overnight. Inspection scheduled tomorrow."
              className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900"
            />
          </div>

          {/* Progress Gallery shortcut */}
          {onOpenGallery && (
            <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-800" />
                <span className="text-xs font-semibold text-stone-800">
                  Site Progress Gallery
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGallery(task);
                }}
                className="px-3 py-1 bg-white hover:bg-stone-50 border border-amber-300 rounded-lg text-xs font-medium text-amber-900 transition-colors cursor-pointer shadow-xs"
              >
                Open Gallery / Upload Photos →
              </button>
            </div>
          )}

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
              disabled={isSaving}
              className="px-5 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              {isSaving ? 'Saving Updates...' : 'Publish Progress Update'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
