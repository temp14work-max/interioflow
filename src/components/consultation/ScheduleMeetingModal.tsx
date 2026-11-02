/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DesignRequest } from '../../types';
import { useApp } from '../../lib/store/AppContext';
import { X, Calendar, Clock, Video, MapPin, CheckCircle2 } from 'lucide-react';

interface ScheduleMeetingModalProps {
  request: DesignRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onScheduled?: () => void;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  request,
  isOpen,
  onClose,
  onScheduled,
}) => {
  const { scheduleMeeting } = useApp();

  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('11:00 AM');
  const [mode, setMode] = useState<'virtual' | 'in_person'>('virtual');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/if-studio-design');
  const [locationAddress, setLocationAddress] = useState('On-Site Property Location');
  const [notes, setNotes] = useState('Review initial architectural floorplan, discuss material palette, and align on timeline requirements.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await scheduleMeeting(request.id, {
        scheduled_date: date,
        scheduled_time: time,
        mode,
        meeting_link: mode === 'virtual' ? meetingLink : undefined,
        location_address: mode === 'in_person' ? locationAddress : undefined,
        designer_notes: notes,
        status: 'scheduled',
      });

      onClose();
      if (onScheduled) onScheduled();
    } catch (err: any) {
      window.alert(err.message);
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
            <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
              Designer Client Coordination
            </div>
            <h3 className="text-base font-semibold text-stone-900 font-serif mt-0.5">
              Schedule Design Consultation Meeting
            </h3>
            <div className="text-xs text-stone-500 mt-1">
              Client: <strong className="text-stone-800">{request.customer_name}</strong> · {request.title}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Meeting Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Preferred Time *
              </label>
              <input
                type="text"
                value={time}
                onChange={e => setTime(e.target.value)}
                placeholder="e.g. 11:00 AM IST"
                className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Meeting Format *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('virtual')}
                className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  mode === 'virtual'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Virtual Video Session</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('in_person')}
                className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  mode === 'in_person'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>In-Person Site Visit</span>
              </button>
            </div>
          </div>

          {mode === 'virtual' ? (
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Video Meeting Link *
              </label>
              <input
                type="url"
                value={meetingLink}
                onChange={e => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Site Location Address *
              </label>
              <input
                type="text"
                value={locationAddress}
                onChange={e => setLocationAddress(e.target.value)}
                placeholder="Client property address"
                className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Discussion Agenda & Preparation Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
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
              {isSubmitting ? 'Scheduling...' : 'Confirm Meeting Schedule'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
