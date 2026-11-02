/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/AuthContext';
import { useApp } from '../../lib/store/AppContext';
import { Task } from '../../types';
import { formatDate, formatRelativeTime } from '../../lib/utils/formatters';
import { TaskUpdateModal } from '../projects/TaskUpdateModal';
import { TaskProgressGalleryModal } from '../projects/TaskProgressGalleryModal';
import {
  Hammer,
  Calendar,
  Layers,
  ArrowRight,
  Camera,
} from 'lucide-react';

interface ContractorDashboardProps {
  onOpenProject: (projectId: string) => void;
}

export const ContractorDashboard: React.FC<ContractorDashboardProps> = ({ onOpenProject }) => {
  const { currentUser } = useAuth();
  const { tasks, getTaskProgressImages } = useApp();

  const [activeTaskForEdit, setActiveTaskForEdit] = useState<Task | null>(null);
  const [activeGalleryTask, setActiveGalleryTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Contractor only sees tasks assigned to them (or all if admin)
  const myTasks = tasks.filter(
    t => t.assigned_contractor_id === currentUser?.id || currentUser?.role === 'admin'
  );

  const filteredTasks = filterStatus === 'all'
    ? myTasks
    : myTasks.filter(t => t.status === filterStatus);

  const completedCount = myTasks.filter(t => t.status === 'completed').length;
  const inProgressCount = myTasks.filter(t => t.status === 'in_progress').length;
  const blockedCount = myTasks.filter(t => t.status === 'blocked').length;

  return (
    <div className="space-y-8">
      {/* Lead Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Contractor Field Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold text-stone-900 font-serif tracking-tight mt-1">
            Work Orders: {currentUser?.display_name || 'Contractor'}
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-xl leading-relaxed">
            Update completion percentages, mark trade milestones, and record site observations for active projects.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
          <div>
            <span className="text-[10px] uppercase font-semibold text-stone-400 block tracking-wider">
              Assigned Tasks
            </span>
            <span className="font-mono text-xl font-bold text-stone-900 tabular-nums">
              {myTasks.length}
            </span>
          </div>
          <div className="h-8 w-px bg-stone-200" />
          <div>
            <span className="text-[10px] uppercase font-semibold text-stone-400 block tracking-wider">
              In Progress
            </span>
            <span className="font-mono text-xl font-bold text-amber-800 tabular-nums">
              {inProgressCount}
            </span>
          </div>
          <div className="h-8 w-px bg-stone-200" />
          <div>
            <span className="text-[10px] uppercase font-semibold text-stone-400 block tracking-wider">
              Completed
            </span>
            <span className="font-mono text-xl font-bold text-emerald-700 tabular-nums">
              {completedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Task Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-stone-900 font-serif">
            Assigned Work Breakdown
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Click on any milestone to update field status, progress slider, and notes.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs">
          {[
            { id: 'all', label: `All (${myTasks.length})` },
            { id: 'in_progress', label: `In Progress (${inProgressCount})` },
            { id: 'todo', label: 'To Do' },
            { id: 'blocked', label: `Blocked (${blockedCount})` },
            { id: 'completed', label: `Done (${completedCount})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-2 p-10 text-center bg-white rounded-2xl border border-dashed border-stone-200 text-stone-400 text-xs">
            No milestones assigned to your account in this category.
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              onClick={() => setActiveTaskForEdit(task)}
              className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:border-stone-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                  <span className="font-semibold uppercase tracking-wider text-stone-600">
                    {task.category} Trade
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                      task.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : task.status === 'in_progress'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : task.status === 'blocked'
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-stone-900 font-serif">
                  {task.title}
                </h3>

                <div className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-stone-400" />
                  <span>Project: <strong className="text-stone-800">{task.project_title}</strong></span>
                </div>

                <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed bg-stone-50/70 p-2.5 rounded-lg border border-stone-100">
                  {task.description}
                </p>

                {task.notes && (
                  <div className="mt-2 text-[11px] bg-amber-50/60 p-2 rounded text-stone-700 border border-amber-200/60">
                    <strong>Site Log:</strong> {task.notes}
                  </div>
                )}

                {/* Progress Gallery (Milestone Site Proof) */}
                {(() => {
                  const taskImages = getTaskProgressImages(task.id);
                  return (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveGalleryTask(task);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer border ${
                          taskImages.length === 0
                            ? 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-600'
                            : 'bg-amber-50/80 hover:bg-amber-100/80 border-amber-200/90 text-stone-800'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 font-medium">
                          <Camera className={`w-3.5 h-3.5 ${taskImages.length > 0 ? 'text-amber-700' : 'text-stone-400'}`} />
                          <span>
                            {taskImages.length === 0
                              ? 'Progress Gallery: No site photos uploaded yet'
                              : `Progress Gallery (${taskImages.length} photo${taskImages.length === 1 ? '' : 's'})`}
                          </span>
                        </span>
                        <span className="text-[11px] text-amber-800 font-semibold hover:underline">
                          {taskImages.length === 0 ? '+ Upload Photo →' : 'View / Add →'}
                        </span>
                      </button>
                    </div>
                  );
                })()}
              </div>

              {/* Progress Slider Display */}
              <div className="space-y-1.5 pt-3 border-t border-stone-100">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    Due {formatDate(task.due_date)}
                  </span>
                  <span className="font-mono font-bold text-stone-900 tabular-nums">
                    {task.progress_percent}%
                  </span>
                </div>

                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-stone-900 h-full rounded-full transition-all"
                    style={{ width: `${task.progress_percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-stone-400">
                    Assigned to {task.assigned_contractor_name}
                  </span>
                  <span className="text-xs text-amber-800 font-medium hover:underline flex items-center gap-1">
                    Update Progress <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Update Modal */}
      {activeTaskForEdit && (
        <TaskUpdateModal
          task={activeTaskForEdit}
          isOpen={!!activeTaskForEdit}
          onClose={() => setActiveTaskForEdit(null)}
          onOpenGallery={t => setActiveGalleryTask(t)}
        />
      )}

      {/* Progress Gallery Modal for Contractors */}
      {activeGalleryTask && (
        <TaskProgressGalleryModal
          task={activeGalleryTask}
          projectId={activeGalleryTask.project_id}
          isOpen={!!activeGalleryTask}
          onClose={() => setActiveGalleryTask(null)}
        />
      )}
    </div>
  );
};
