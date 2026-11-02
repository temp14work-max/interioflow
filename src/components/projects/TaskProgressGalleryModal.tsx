/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/AuthContext';
import { useApp } from '../../lib/store/AppContext';
import { Task, TaskProgressImage } from '../../types';
import { formatDate, formatRelativeTime } from '../../lib/utils/formatters';
import {
  Camera,
  X,
  Upload,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Trash2,
  Maximize2,
  HardHat,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';

interface TaskProgressGalleryModalProps {
  task: Task | null;
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

// Preset verified site photos for realistic contractor & designer demonstrations
const PRESET_SITE_PHOTOS = [
  {
    label: 'Conduit Chasing',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?auto=format&fit=crop&w=1200&q=80',
    caption: 'Concealed electrical conduit slots grooved and conduits anchored before flush plastering.',
    tag: 'Electrical Rough-in',
  },
  {
    label: 'Ceiling Framing',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    caption: 'Laser-level inspected GI perimeter runners and shadowline reveals installed.',
    tag: 'Carpentry & Framing',
  },
  {
    label: 'Marble Laying',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    caption: 'Bookmatched Italian Statuario travertine dry-laid for vein alignment inspection.',
    tag: 'Flooring & Masonry',
  },
  {
    label: 'Millwork Dry-Fit',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    caption: 'Solid European oak carcasses leveled and anchored with Blum soft-close hardware.',
    tag: 'Joinery Dry-Fit',
  },
  {
    label: 'Plumbing Pressure Test',
    url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1200&q=80',
    caption: 'Hydrostatic pressure test sustained at 10 bar for 4 hours with zero pressure drop.',
    tag: 'Plumbing & MEP',
  },
  {
    label: 'Primer & Surface Prep',
    url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80',
    caption: 'Low-VOC acrylic primer mist-coat applied across drywall reveals under floodlights.',
    tag: 'Painting Prep',
  },
];

export const TaskProgressGalleryModal: React.FC<TaskProgressGalleryModalProps> = ({
  task,
  projectId,
  isOpen,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const { getTaskProgressImages, addProgressImage, deleteProgressImage } = useApp();

  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>('');
  const [customCaption, setCustomCaption] = useState<string>('');
  const [stageTag, setStageTag] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(task?.progress_percent || 0);
  const [uploadError, setUploadError] = useState<string>('');
  const [lightboxImage, setLightboxImage] = useState<TaskProgressImage | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  if (!isOpen || !task) return null;

  const taskImages = getTaskProgressImages(task.id);

  // Row level security decides who can read a task's images and who can change them.
  const isSuperAdmin = currentUser?.role === 'admin';
  const canView = !!currentUser;

  // Can upload / delete: Contractors, Designers, Admins (Customers have transparent read-only access)
  const canUpload = isSuperAdmin || currentUser?.role === 'contractor' || currentUser?.role === 'designer';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Image file size must be less than 8MB.');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: (typeof PRESET_SITE_PHOTOS)[0]) => {
    setSelectedPhotoUrl(preset.url);
    if (!customCaption) setCustomCaption(preset.caption);
    if (!stageTag) setStageTag(preset.tag);
  };

  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhotoUrl) {
      setUploadError('Please choose or upload a site progress image.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      await addProgressImage(task.id, projectId, {
        image_url: selectedPhotoUrl,
        caption: customCaption.trim() || undefined,
        stage_tag: stageTag.trim() || `${task.category.toUpperCase()} Inspection`,
        progress_percent: progressPercent,
      });

      // Reset form
      setSelectedPhotoUrl('');
      setCustomCaption('');
      setStageTag('');
      setShowUploadForm(false);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload progress image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imgId: string) => {
    if (window.confirm('Are you sure you want to remove this site progress record?')) {
      try {
        await deleteProgressImage(imgId);
        if (lightboxImage?.id === imgId) {
          setLightboxImage(null);
        }
      } catch (err: any) {
        setUploadError(err.message);
      }
    }
  };

  const formatUploadTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const datePart = d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const timePart = d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return { datePart, timePart, full: `${datePart} at ${timePart}` };
    } catch {
      return { datePart: formatDate(isoString), timePart: '', full: formatDate(isoString) };
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 flex items-start justify-between bg-stone-50/70">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                <Camera className="w-3 h-3" />
                Progress Gallery
              </span>
              <span className="text-xs text-stone-400 font-mono">
                {task.category.toUpperCase()} · Task #{task.id}
              </span>
            </div>
            <h2 className="text-xl font-bold font-serif text-stone-900">
              {task.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-stone-600">
              <span className="inline-flex items-center gap-1 font-medium text-stone-700">
                <HardHat className="w-3.5 h-3.5 text-stone-500" />
                {task.assigned_contractor_name || 'Master Contractor'}
              </span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="inline-flex items-center gap-1 text-stone-500">
                <Clock className="w-3.5 h-3.5" />
                Due {formatDate(task.due_date)}
              </span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="font-mono text-stone-700 font-semibold">
                Current: {task.progress_percent}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canUpload && !showUploadForm && (
              <button
                type="button"
                onClick={() => setShowUploadForm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Site Photo</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {!canView ? (
            <div className="p-8 text-center bg-red-50 rounded-xl border border-red-200">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-red-900">Access Restricted</h3>
              <p className="text-xs text-red-700 mt-1 max-w-md mx-auto">
                Role-based access enforcement: Only the assigned client, designer, and contractor for this project milestone are authorized to view site progress imagery.
              </p>
            </div>
          ) : (
            <>
              {/* Uploader Form (if triggered) */}
              {showUploadForm && canUpload && (
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-stone-800" />
                      <h3 className="text-sm font-bold text-stone-900">
                        Upload Site Working Verification Photo
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowUploadForm(false);
                        setSelectedPhotoUrl('');
                        setUploadError('');
                      }}
                      className="text-xs text-stone-500 hover:text-stone-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <p className="text-xs text-stone-600">
                    Upload an authentic site inspection photo or progress record. The client and design team will see the exact timestamp, stage tag, and notes you provide.
                  </p>

                  {uploadError && (
                    <div className="text-xs text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitUpload} className="space-y-4">
                    {/* File Upload OR Quick Preset Chips */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        1. Choose Image from Device or Select Realistic Demo Site Photo:
                      </label>
                      
                      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                        <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-stone-300 hover:border-stone-500 bg-white rounded-xl p-4 cursor-pointer transition-colors text-center">
                          <Upload className="w-6 h-6 text-stone-400 mb-1.5" />
                          <span className="text-xs font-semibold text-stone-800">
                            Select Photo from Computer
                          </span>
                          <span className="text-[10px] text-stone-400 mt-0.5">
                            PNG, JPG, WebP up to 8MB
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>

                        {/* Selected Photo Preview */}
                        {selectedPhotoUrl && (
                          <div className="relative w-32 h-28 rounded-xl overflow-hidden border border-stone-300 bg-stone-100 shrink-0">
                            <img
                              src={selectedPhotoUrl}
                              alt="Upload preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setSelectedPhotoUrl('')}
                              className="absolute top-1 right-1 p-1 bg-stone-900/80 hover:bg-stone-900 text-white rounded-full cursor-pointer"
                              title="Remove photo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded font-mono">
                              Preview
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Quick Presets */}
                      <div className="mt-2.5">
                        <span className="text-[11px] font-medium text-stone-500 block mb-1">
                          Or select realistic field site preset:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_SITE_PHOTOS.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectPreset(preset)}
                              className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                                selectedPhotoUrl === preset.url
                                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                              }`}
                            >
                              📷 {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Metadata fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Stage Tag / Inspection Scope
                        </label>
                        <input
                          type="text"
                          value={stageTag}
                          onChange={e => setStageTag(e.target.value)}
                          placeholder="e.g. Laser Alignment Verification"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Progress Percentage at this Milestone
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={progressPercent}
                            onChange={e => setProgressPercent(Number(e.target.value))}
                            className="flex-1 accent-stone-900"
                          />
                          <span className="font-mono text-xs font-bold text-stone-800 w-10 text-right">
                            {progressPercent}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Contractor Field Notes & Execution Log
                      </label>
                      <textarea
                        value={customCaption}
                        onChange={e => setCustomCaption(e.target.value)}
                        rows={2}
                        placeholder="Provide practical field details for the client (e.g. Conducted pressure testing; acoustic dampening layer installed before ceiling closure)..."
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowUploadForm(false)}
                        className="px-3.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUploading || !selectedPhotoUrl}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        {isUploading ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Uploading Site Record...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Save to Progress Gallery</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Gallery Grid or Empty State */}
              {taskImages.length === 0 ? (
                <div className="py-14 px-6 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs border border-stone-200 text-stone-400">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-stone-900 font-serif">
                    Progress Gallery: No site photos uploaded yet
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
                    Contractors and designers will upload verified site progress photos and inspection proofs here as physical work on this trade milestone proceeds.
                  </p>
                  {canUpload && !showUploadForm && (
                    <button
                      type="button"
                      onClick={() => setShowUploadForm(true)}
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload first site photo</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-stone-500 font-medium">
                      Showing <strong>{taskImages.length}</strong> verified site progress record{taskImages.length === 1 ? '' : 's'}. Sorted chronologically by upload time.
                    </p>
                    <span className="text-[11px] text-stone-400">
                      Click image for high-resolution view
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {taskImages.map(img => {
                      const timeData = formatUploadTime(img.created_at);
                      const canDelete =
                        isSuperAdmin ||
                        currentUser?.id === img.uploader_id ||
                        currentUser?.role === 'contractor' ||
                        currentUser?.role === 'designer';

                      return (
                        <div
                          key={img.id}
                          className="group bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                        >
                          {/* Image Container */}
                          <div
                            onClick={() => setLightboxImage(img)}
                            className="relative aspect-16/10 bg-stone-100 cursor-pointer overflow-hidden"
                          >
                            <img
                              src={img.image_url}
                              alt={img.caption || 'Site progress photo'}
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                              loading="lazy"
                            />
                            
                            {/* Overlay Badges */}
                            <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-900/80 text-white backdrop-blur-xs font-mono">
                                {img.progress_percent_at_upload}% Complete
                              </span>
                              {img.stage_tag && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-600/90 text-white backdrop-blur-xs">
                                  {img.stage_tag}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setLightboxImage(img);
                              }}
                              className="absolute bottom-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                              title="Enlarge photo"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Details & Timestamp */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div>
                              {/* Exact Upload Timestamp */}
                              <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
                                <span className="inline-flex items-center gap-1 font-medium text-stone-700">
                                  <Clock className="w-3 h-3 text-stone-400" />
                                  <span>{timeData.full}</span>
                                </span>
                                <span className="text-[10px] text-stone-400">
                                  {formatRelativeTime(img.created_at)}
                                </span>
                              </div>

                              {/* Caption / Field Notes */}
                              <p className="text-xs text-stone-800 leading-relaxed font-sans">
                                {img.caption || 'Verified site milestone inspection photograph.'}
                              </p>
                            </div>

                            {/* Footer: Attribution + Actions */}
                            <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 text-[10px] font-bold">
                                  {img.uploader_role === 'contractor' ? '🛠️' : img.uploader_role === 'designer' ? '📐' : '👤'}
                                </span>
                                <div className="leading-tight">
                                  <span className="font-semibold text-stone-800 block">
                                    {img.uploader_name}
                                  </span>
                                  <span className="text-[10px] text-stone-400 uppercase tracking-wider capitalize">
                                    {img.uploader_role}
                                  </span>
                                </div>
                              </div>

                              {canDelete && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteImage(img.id)}
                                  className="text-stone-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                                  title="Remove image record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Role-governed site proof: Protected under InterioFlow Milestone Trust Framework.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Close Gallery
          </button>
        </div>
      </div>

      {/* Lightbox Modal for enlarged view */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex flex-col justify-between p-4 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setLightboxImage(null)}
        >
          <div className="flex items-center justify-between text-white p-2">
            <div>
              <span className="text-xs text-stone-300 font-mono">
                {lightboxImage.stage_tag || 'Site Progress Photo'}
              </span>
              <h4 className="text-sm font-semibold text-white">
                {task.title}
              </h4>
            </div>
            <button
              onClick={() => setLightboxImage(null)}
              className="p-2 text-stone-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-2 max-h-[75vh]">
            <img
              src={lightboxImage.image_url}
              alt="Enlarged progress photo"
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
          </div>

          <div
            className="bg-stone-900/90 text-white p-4 rounded-xl max-w-2xl mx-auto w-full border border-stone-800"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
              <span>Uploaded by {lightboxImage.uploader_name} ({lightboxImage.uploader_role})</span>
              <span>{formatUploadTime(lightboxImage.created_at).full}</span>
            </div>
            <p className="text-sm text-stone-200">
              {lightboxImage.caption || 'Verified milestone field execution photograph.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
