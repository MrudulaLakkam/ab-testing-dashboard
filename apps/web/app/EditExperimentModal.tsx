'use client';

import { useState } from 'react';
import { supabase } from './supabaseClient';
import { X, Sparkles, Beaker, TestTube2, Loader2, CheckCircle2 } from 'lucide-react';

interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  variant_a: string;
  variant_b: string;
  status: 'draft' | 'active' | 'completed';
}

export function EditExperimentModal({
  experiment,
  onClose,
  onUpdate,
}: {
  experiment: Experiment;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [formData, setFormData] = useState({
    name: experiment.name,
    hypothesis: experiment.hypothesis,
    variant_a: experiment.variant_a,
    variant_b: experiment.variant_b,
    status: experiment.status,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('experiments')
        .update({
          name: formData.name,
          hypothesis: formData.hypothesis,
          variant_a: formData.variant_a,
          variant_b: formData.variant_b,
          status: formData.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', experiment.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update experiment');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center space-y-4 border border-gray-200">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Experiment Updated!</h3>
          <p className="text-gray-600">
            Your changes have been saved successfully
          </p>
          <div className="bg-emerald-50 rounded-lg p-4 text-sm text-emerald-700">
            Changes will be reflected immediately
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 border border-gray-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Experiment</h2>
            </div>
            <p className="text-gray-600 text-sm">
              Update your experiment details and configuration
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-600 hover:text-gray-900 flex-shrink-0 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl border border-red-200 bg-red-50">
            <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold">!</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <FormField
            label="Experiment Name"
            hint="Use the format: surface — change"
          >
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              placeholder="e.g., Homepage hero — Video vs Static"
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </FormField>

          {/* Hypothesis */}
          <FormField
            label="Hypothesis"
            hint="The strongest experiments name a metric and a magnitude"
          >
            <textarea
              name="hypothesis"
              value={formData.hypothesis}
              onChange={handleChange}
              disabled={loading}
              rows={3}
              placeholder="Switching the primary CTA color from blue to coral will lift homepage CTR by ~10%..."
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </FormField>

          {/* Variants Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Variant A */}
            <VariantField
              icon={Beaker}
              heading="Variant A"
              tag="Control"
              name="variant_a"
              value={formData.variant_a}
              onChange={handleChange}
              disabled={loading}
              tone="control"
            />

            {/* Variant B */}
            <VariantField
              icon={TestTube2}
              heading="Variant B"
              tag="Treatment"
              name="variant_b"
              value={formData.variant_b}
              onChange={handleChange}
              disabled={loading}
              tone="treatment"
            />
          </div>

          {/* Status */}
          <FormField
            label="Status"
            hint="Control the experiment lifecycle"
          >
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </FormField>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:scale-[1.02] active:scale-[0.98] font-semibold text-sm shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Save changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-900 mb-2 block">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-600 mt-1.5">{hint}</p>}
    </div>
  );
}

function VariantField({
  icon: Icon,
  heading,
  tag,
  name,
  value,
  onChange,
  disabled,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  heading: string;
  tag: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  tone: 'control' | 'treatment';
}) {
  const isTreatment = tone === 'treatment';

  return (
    <div
      className={`rounded-2xl p-5 md:p-6 border transition-all ${
        isTreatment
          ? 'border-blue-300/60 bg-gradient-to-br from-blue-50/70 via-white/70 to-white/50'
          : 'border-gray-300 bg-white/50'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isTreatment
              ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600'
              : 'text-blue-600 bg-blue-100'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-gray-900">{heading}</p>
          <p className={`text-[10px] uppercase tracking-wider font-bold ${
            isTreatment ? 'text-blue-600' : 'text-gray-600'
          }`}>{tag}</p>
        </div>
      </div>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={`e.g., ${heading === 'Variant A' ? 'Existing blue CTA' : 'Coral CTA + new copy'}`}
        className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}
