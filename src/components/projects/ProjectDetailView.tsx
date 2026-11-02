/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/AuthContext';
import { useApp } from '../../lib/store/AppContext';
import { Project, Task } from '../../types';
import { formatINR, formatDate, formatRelativeTime } from '../../lib/utils/formatters';
import { TaskUpdateModal } from './TaskUpdateModal';
import { CreateTaskModal } from './CreateTaskModal';
import { TaskProgressGalleryModal } from './TaskProgressGalleryModal';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  User,
  ShieldCheck,
  Hammer,
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Camera,
} from 'lucide-react';

interface ProjectDetailViewProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ projectId, onBack }) => {
  const { currentUser } = useAuth();
  const { projects, tasks, updates, addProjectUpdate, proposals, getTaskProgressImages } = useApp();

  const project = projects.find(p => p.id === projectId);
  const projectTasks = tasks.filter(t => t.project_id === projectId);
  const projectUpdates = updates.filter(u => u.project_id === projectId);
  const linkedProposal = proposals.find(p => p.id === project?.proposal_id);

  const [activeTaskForModal, setActiveTaskForModal] = useState<Task | null>(null);
  const [activeGalleryTask, setActiveGalleryTask] = useState<Task | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [newUpdateMessage, setNewUpdateMessage] = useState('');

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-stone-500 text-sm">Project not found or you do not have permission to view it.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-stone-900 text-white text-xs rounded-lg">
          Back to Projects
        </button>
      </div>
    );
  }

  const isStaff = currentUser?.role === 'designer' || currentUser?.role === 'admin';

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUpdateMessage.trim()) {
      try {
        await addProjectUpdate(project.id, newUpdateMessage.trim());
        setNewUpdateMessage('');
      } catch (err: any) {
        window.alert(err.message);
      }
    }
  };

  // Status badge styling without pill fluff
  const statusStyles: Record<string, string> = {
    planned: 'text-stone-600 bg-stone-100 border border-stone-200',
    in_progress: 'text-amber-800 bg-amber-50 border border-amber-200',
    on_hold: 'text-red-700 bg-red-50 border border-red-200',
    completed: 'text-emerald-800 bg-emerald-50 border border-emerald-200',
    cancelled: 'text-stone-500 bg-stone-100 border border-stone-200',
  };

  return (
    <div className="space-y-8">
      {/* Back button & Title Bar */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects Overview</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 text-xs text-stone-500 mb-1">
              <span>Project ID: {project.id}</span>
              <span aria-hidden="true">·</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${statusStyles[project.status] || statusStyles.planned}`}>
                {(project.status || 'planned').replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-stone-900 font-serif tracking-tight">
              {project.title}
            </h1>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-6 bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-400 block tracking-wider">
                Approved Budget
              </span>
              <span className="text-base font-bold font-mono text-stone-900 tabular-nums">
                {formatINR(project.budget_paise)}
              </span>
            </div>
            <div className="h-8 w-px bg-stone-200" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-400 block tracking-wider">
                Target Handover
              </span>
              <span className="text-sm font-semibold text-stone-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                {formatDate(project.target_end_date)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
              Execution Progress
            </span>
          </div>
          <span className="text-sm font-mono font-bold text-stone-900 tabular-nums">
            {project.progress_percent}% Complete
          </span>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden p-0.5 border border-stone-200">
          <div
            className="bg-stone-900 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${project.progress_percent}%` }}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-stone-100 text-xs text-stone-600">
          <div>
            <span className="text-stone-400 block text-[11px]">Client</span>
            <span className="font-medium text-stone-900 flex items-center gap-1 mt-0.5">
              <User className="w-3.5 h-3.5 text-stone-400" />
              {project.customer_name}
            </span>
          </div>
          <div>
            <span className="text-stone-400 block text-[11px]">Lead Architect</span>
            <span className="font-medium text-stone-900 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              {project.designer_name}
            </span>
          </div>
          <div>
            <span className="text-stone-400 block text-[11px]">Kickoff Date</span>
            <span className="font-medium text-stone-900 mt-0.5 block">{formatDate(project.start_date)}</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[11px]">Active Tasks</span>
            <span className="font-medium text-stone-900 mt-0.5 block">
              {projectTasks.filter(t => t.status === 'completed').length} / {projectTasks.length} Done
            </span>
          </div>
        </div>
      </div>

      {/* 3D Architectural Renders & Site Photography */}
      <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
              Architectural Visualizations & Verified Site Photos
            </h3>
          </div>
          <span className="text-[11px] text-stone-400">
            Render Schedule · 4 Perspectives
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 p-2 bg-stone-50">
          <div className="relative sm:col-span-2 aspect-16/9 rounded-xl overflow-hidden bg-stone-900 group">
            <img
              src={project.image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"}
              alt="Primary 3D Perspective"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-white flex justify-between items-center text-xs">
              <span className="font-medium">Primary Living & Dining Spatial Render</span>
              <span className="bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded text-[10px]">Turnkey Deliverable</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-1">
            <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-stone-900 group">
              <img
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80"
                alt="Material Joinery Detail"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-stone-950/30" />
              <span className="absolute bottom-2 left-2 text-[10px] text-white font-medium bg-stone-900/60 px-1.5 py-0.5 rounded">
                Joinery & Millwork
              </span>
            </div>
            <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-stone-900 group">
              <img
                src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80"
                alt="Cove Lighting Verification"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-stone-950/30" />
              <span className="absolute bottom-2 left-2 text-[10px] text-white font-medium bg-stone-900/60 px-1.5 py-0.5 rounded">
                Lighting & Finishes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Tasks & Milestones (Left 7 cols) + Timeline Feed (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Milestone & Contractor Tasks */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-stone-900 font-serif">
                Milestones & Trade Tasks
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Contractors update live status and progress percentages for each trade.
              </p>
            </div>
            {isStaff && (
              <button
                onClick={() => setIsCreateTaskOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Milestone</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {projectTasks.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-dashed border-stone-200">
                <p className="text-xs text-stone-500">No tasks assigned yet.</p>
                {isStaff && (
                  <button
                    onClick={() => setIsCreateTaskOpen(true)}
                    className="mt-2 text-xs text-stone-900 font-medium underline"
                  >
                    Assign first contractor task
                  </button>
                )}
              </div>
            ) : (
              projectTasks.map(task => {
                const canEditTask =
                  currentUser?.role === 'admin' ||
                  currentUser?.role === 'designer' ||
                  currentUser?.id === task.assigned_contractor_id ||
                  currentUser?.role === 'contractor';

                return (
                  <div
                    key={task.id}
                    onClick={() => canEditTask && setActiveTaskForModal(task)}
                    className={`bg-white p-4.5 rounded-xl border border-stone-200/80 shadow-xs transition-all ${
                      canEditTask ? 'hover:border-stone-400 hover:shadow-sm cursor-pointer' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-stone-400 mb-1">
                          <span className="capitalize font-semibold text-stone-600">{task.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>Due {formatDate(task.due_date)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-stone-600 font-medium">{task.assigned_contractor_name}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-stone-900">
                          {task.title}
                        </h3>
                      </div>

                      <span
                        className={`text-[11px] px-2 py-0.5 rounded font-medium capitalize ${
                          task.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : task.status === 'in_progress'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : task.status === 'blocked'
                            ? 'bg-red-50 text-red-800 border border-red-200'
                            : 'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed mb-3">
                      {task.description}
                    </p>

                    {task.notes && (
                      <div className="mb-3 text-[11px] bg-stone-50 p-2 rounded text-stone-600 border border-stone-100">
                        <strong className="text-stone-800">Contractor Log:</strong> {task.notes}
                      </div>
                    )}

                    {/* Progress Gallery Section (Trade & Milestone Site Photos) */}
                    {(() => {
                      const taskImages = getTaskProgressImages(task.id);
                      if (taskImages.length === 0) {
                        return (
                          <div className="mb-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveGalleryTask(task);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200/90 rounded-lg text-xs text-stone-600 transition-colors group cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5 font-medium text-stone-700">
                                <Camera className="w-3.5 h-3.5 text-stone-500" />
                                <span>Progress Gallery: No site photos uploaded yet</span>
                              </span>
                              <span className="text-[11px] text-amber-800 font-semibold group-hover:underline">
                                {currentUser?.role === 'customer' ? 'Open Gallery →' : '+ Upload Photo →'}
                              </span>
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className="mb-3 space-y-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveGalleryTask(task);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/90 rounded-lg text-xs transition-colors group cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5 font-semibold text-stone-900">
                              <Camera className="w-3.5 h-3.5 text-amber-700" />
                              <span>Progress Gallery ({taskImages.length} site photo{taskImages.length === 1 ? '' : 's'})</span>
                            </span>
                            <span className="text-[11px] text-amber-900 font-medium group-hover:underline flex items-center gap-1">
                              <span>Latest {formatRelativeTime(taskImages[0].created_at)}</span>
                              <span>→</span>
                            </span>
                          </button>

                          {/* Quick thumbnail strip with upload timestamps */}
                          <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {taskImages.slice(0, 4).map((img) => (
                              <div
                                key={img.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveGalleryTask(task);
                                }}
                                className="relative w-14 h-14 rounded-lg overflow-hidden border border-stone-200 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                                title={`${img.stage_tag || 'Progress photo'} · ${formatDate(img.created_at)}`}
                              >
                                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                                <span className="absolute bottom-0 inset-x-0 bg-stone-900/80 text-white text-[8px] font-mono text-center py-0.5">
                                  {img.progress_percent_at_upload}%
                                </span>
                              </div>
                            ))}
                            {taskImages.length > 4 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveGalleryTask(task);
                                }}
                                className="w-14 h-14 rounded-lg border border-dashed border-stone-300 bg-stone-50 flex flex-col items-center justify-center text-[10px] text-stone-500 hover:bg-stone-100 shrink-0 cursor-pointer"
                              >
                                <span>+{taskImages.length - 4}</span>
                                <span className="text-[8px]">more</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Task Progress Bar */}
                    <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
                      <div className="flex-1 bg-stone-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-stone-800 h-full rounded-full"
                          style={{ width: `${task.progress_percent}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-stone-500 tabular-nums">
                        {task.progress_percent}%
                      </span>
                      {canEditTask && (
                        <span className="text-[11px] text-amber-800 font-medium hover:underline">
                          Update Status →
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Timeline & Field Updates */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-stone-900 font-serif">
              Project Timeline & Field Log
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Live updates logged by designers, clients, and contractors.
            </p>
          </div>

          {/* Quick Post Box */}
          <form onSubmit={handlePostUpdate} className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-xs">
            <div className="text-[11px] text-stone-500 mb-1.5 font-medium">
              Post an update as <strong className="text-stone-800">{currentUser?.display_name || 'Team Member'}</strong>:
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newUpdateMessage}
                onChange={e => setNewUpdateMessage(e.target.value)}
                placeholder="Log milestone progress, note site visit findings, or ask questions..."
                className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden text-stone-900"
              />
              <button
                type="submit"
                disabled={!newUpdateMessage.trim()}
                className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Post</span>
              </button>
            </div>
          </form>

          {/* Activity Feed */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
            {linkedProposal && (
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-700">
                <div className="font-semibold text-stone-900 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Scope Deliverables
                </div>
                <ul className="list-disc list-inside space-y-1 text-stone-600 text-[11px]">
                  {(linkedProposal.deliverables || [
                    'Complete CAD Architectural Drawings & Dimensioned Layouts',
                    'High-Resolution 3D Photorealistic Perspectives & Moodboards',
                    'Itemized Bill of Quantities (BOQ) with Material Specifications',
                  ]).slice(0, 3).map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4 pt-1">
              {projectUpdates.length === 0 ? (
                <p className="text-xs text-stone-400">No updates posted yet.</p>
              ) : (
                <div className="relative pl-5 border-l border-stone-200 space-y-4">
                  {projectUpdates.map(update => (
                    <div key={update.id} className="relative">
                      <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-stone-900 ring-4 ring-white" />
                      <div className="text-[11px] text-stone-400">
                        {formatRelativeTime(update.created_at)} · {update.author_name} ({update.author_role})
                      </div>
                      <p className="text-xs text-stone-700 mt-0.5 leading-relaxed">{update.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Task Update Modal */}
      {activeTaskForModal && (
        <TaskUpdateModal
          task={activeTaskForModal}
          isOpen={!!activeTaskForModal}
          onClose={() => setActiveTaskForModal(null)}
          onOpenGallery={t => setActiveGalleryTask(t)}
        />
      )}

      {/* Create Task Modal */}
      {isCreateTaskOpen && (
        <CreateTaskModal
          projectId={project.id}
          projectTitle={project.title}
          isOpen={isCreateTaskOpen}
          onClose={() => setIsCreateTaskOpen(false)}
        />
      )}

      {/* Milestone & Trade Task Progress Gallery Modal */}
      {activeGalleryTask && (
        <TaskProgressGalleryModal
          task={activeGalleryTask}
          projectId={project.id}
          isOpen={!!activeGalleryTask}
          onClose={() => setActiveGalleryTask(null)}
        />
      )}
    </div>
  );
};
