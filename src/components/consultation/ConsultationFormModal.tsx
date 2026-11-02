/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/AuthContext';
import { useApp } from '../../lib/store/AppContext';
import { ProjectType } from '../../types';
import { ConsultationRequestSchema } from '../../lib/validation/schemas';
import { X, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

interface ConsultationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessNavigate?: () => void;
}

const STYLE_OPTIONS = [
  'Scandinavian Minimal',
  'Modern Japandi',
  'Warm Architectural',
  'Contemporary Industrial',
  'Biophilic & Natural',
  'Mid-Century Modern',
];

export const ConsultationFormModal: React.FC<ConsultationFormModalProps> = ({
  isOpen,
  onClose,
  onSuccessNavigate,
}) => {
  const { currentUser, openAuthModal } = useAuth();
  const { submitRequest } = useApp();

  const [title, setTitle] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('residential');
  const [areaSqft, setAreaSqft] = useState<number>(1200);
  const [budgetMinRupees, setBudgetMinRupees] = useState<number>(800000); // ₹8,00,000
  const [budgetMaxRupees, setBudgetMaxRupees] = useState<number>(1400000); // ₹14,00,000
  const [styles, setStyles] = useState<string[]>(['Scandinavian Minimal', 'Warm Architectural']);
  const [city, setCity] = useState('Bengaluru');
  const [requirements, setRequirements] = useState('');
  const [phone, setPhone] = useState(currentUser?.phone || '');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Sync user info whenever modal opens or currentUser updates
  React.useEffect(() => {
    if (currentUser?.phone) setPhone(currentUser.phone);
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const toggleStyle = (style: string) => {
    setStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // The form stays filled in behind the sign-in dialog.
    if (!currentUser) {
      openAuthModal('signup');
      return;
    }

    const effectivePhone = phone.trim();

    // Validate with Zod
    const validationResult = ConsultationRequestSchema.safeParse({
      title,
      project_type: projectType,
      area_sqft: Number(areaSqft),
      budget_min_paise: Math.round(Number(budgetMinRupees) * 100),
      budget_max_paise: Math.round(Number(budgetMaxRupees) * 100),
      city,
      requirements,
      style_preferences: styles,
      preferred_contact: currentUser.email,
      customer_phone: effectivePhone,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach(err => {
        const fieldName = err.path.join('.');
        fieldErrors[fieldName] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const newReq = await submitRequest({
        customer_id: currentUser.id,
        customer_name: currentUser.display_name,
        customer_email: currentUser.email,
        customer_phone: effectivePhone,
        title,
        project_type: projectType,
        area_sqft: Number(areaSqft),
        budget_min_paise: Math.round(Number(budgetMinRupees) * 100),
        budget_max_paise: Math.round(Number(budgetMaxRupees) * 100),
        style_preferences: styles,
        city,
        requirements,
      });

      setSubmittedId(newReq.id);
    } catch (err: any) {
      setErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 bg-stone-50/50">
          <div>
            <h3 className="text-lg font-semibold text-stone-900 font-serif">
              Interior Design Consultation Request
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Submit your property details to receive a customized design scope and quotation.
            </p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedId ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-semibold text-stone-900 font-serif">
              Consultation Request Received
            </h4>
            <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              Your request for <strong className="text-stone-900">{title}</strong> has been registered. An interior designer will review your specifications and issue a formal proposal.
            </p>
            <div className="text-xs text-stone-500 bg-stone-50 py-2 px-4 rounded-lg inline-block border border-stone-200">
              Request Reference ID: <span className="font-mono text-stone-800 font-medium">{submittedId}</span>
            </div>
            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={handleResetAndClose}
                className="px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
              {onSuccessNavigate && (
                <button
                  onClick={() => {
                    handleResetAndClose();
                    onSuccessNavigate();
                  }}
                  className="px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                >
                  View in Project Workspace
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {Object.keys(errors).length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Please resolve the following:</div>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    {Object.values(errors).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Project Title */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Project Title / Summary *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Modern Minimalist 3BHK Apartment in Indiranagar"
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900 placeholder:text-stone-400"
                required
              />
            </div>

            {/* Project Type & Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Property Type *
                </label>
                <select
                  value={projectType}
                  onChange={e => setProjectType(e.target.value as ProjectType)}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900"
                >
                  <option value="residential">Residential Apartment</option>
                  <option value="single_room">Single Room / Suite</option>
                  <option value="renovation">Renovation & Remodel</option>
                  <option value="full_villa">Independent Villa</option>
                  <option value="commercial">Commercial / Studio</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Carpet Area (sq. ft) *
                </label>
                <input
                  type="number"
                  value={areaSqft}
                  onChange={e => setAreaSqft(Number(e.target.value))}
                  min={100}
                  step={50}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900"
                  required
                />
              </div>
            </div>

            {/* Budget Range (INR) */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Estimated Budget Range (₹ INR) *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] text-stone-500 mb-1 block">Minimum: ₹{(budgetMinRupees).toLocaleString('en-IN')}</span>
                  <input
                    type="number"
                    value={budgetMinRupees}
                    onChange={e => setBudgetMinRupees(Number(e.target.value))}
                    min={50000}
                    step={25000}
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 mb-1 block">Maximum: ₹{(budgetMaxRupees).toLocaleString('en-IN')}</span>
                  <input
                    type="number"
                    value={budgetMaxRupees}
                    onChange={e => setBudgetMaxRupees(Number(e.target.value))}
                    min={50000}
                    step={25000}
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900"
                  />
                </div>
              </div>
            </div>

            {/* Style Preferences */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Design Aesthetic Preferences (Select Multiple)
              </label>
              <div className="flex flex-wrap gap-2">
                {STYLE_OPTIONS.map(style => {
                  const isSelected = styles.includes(style);
                  return (
                    <button
                      type="button"
                      key={style}
                      onClick={() => toggleStyle(style)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Client Account & Contact Details */}
            {currentUser ? (
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-semibold">
                      {currentUser.display_name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-stone-900">{currentUser.display_name}</div>
                      <div className="text-[11px] text-stone-500">{currentUser.email} • Role: {currentUser.role}</div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800">
                    Verified Account
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-200/60">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      City / Location *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="e.g. Bengaluru, Mumbai, Delhi"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900"
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-stone-900">You will need an account to submit</div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    Submitting asks you to sign in or create one, then brings you back to this form.
                  </div>
                </div>
                <Lock className="w-4 h-4 text-stone-400 shrink-0" />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Specific Requirements, Mood & Functional Needs *
              </label>
              <textarea
                value={requirements}
                onChange={e => setRequirements(e.target.value)}
                rows={3}
                placeholder="Mention specific elements such as concealed storage, home office nook, warm cove lighting, acoustic walls, or timeline expectations..."
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900 placeholder:text-stone-400"
                required
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                {isSubmitting ? 'Submitting Request...' : 'Submit Consultation Request'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
