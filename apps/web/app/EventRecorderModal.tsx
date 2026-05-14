'use client';

import { useState } from 'react';
import { supabase } from './supabaseClient';
import { X, Sparkles, Beaker, TestTube2, TrendingUp, Loader2, CheckCircle2 } from 'lucide-react';

interface Props {
  experimentId: string;
  variantA: string;
  variantB: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EventRecorderModal({ experimentId, variantA, variantB, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    variantAViews: 500,
    variantAConversions: 100,
    variantBViews: 500,
    variantBConversions: 125,
  });

  const handleAddEvents = async () => {
    setLoading(true);
    try {
      // Generate events for Variant A
      const eventsA = Array.from({ length: formData.variantAViews }, (_, i) => ({
        experiment_id: experimentId,
        user_id: `user_${Math.random().toString(36).substr(2, 9)}`,
        variant: 'a',
        event_type: i < formData.variantAConversions ? 'conversion' : 'view',
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      }));

      // Generate events for Variant B
      const eventsB = Array.from({ length: formData.variantBViews }, (_, i) => ({
        experiment_id: experimentId,
        user_id: `user_${Math.random().toString(36).substr(2, 9)}`,
        variant: 'b',
        event_type: i < formData.variantBConversions ? 'conversion' : 'view',
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      }));

      const allEvents = [...eventsA, ...eventsB];

      // Insert events
      const { error } = await supabase.from('events').insert(allEvents);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
      setLoading(false);
    }
  };

  const convRateA = (formData.variantAConversions / formData.variantAViews) * 100;
  const convRateB = (formData.variantBConversions / formData.variantBViews) * 100;
  const lift = ((convRateB - convRateA) / convRateA) * 100;

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center space-y-4 border border-gray-200">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Events Added!</h3>
          <p className="text-gray-600">
            Successfully generated <span className="font-semibold">{formData.variantAViews + formData.variantBViews}</span> test events
          </p>
          <div className="bg-emerald-50 rounded-lg p-4 text-sm text-emerald-700">
            Your experiment is ready for analysis
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
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Add Test Events</h2>
            </div>
            <p className="text-gray-600 text-sm">
              Generate sample events to test your experiment analysis
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

        {/* Variants Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Variant A */}
          <VariantInput
            icon={Beaker}
            heading="Variant A"
            tag="Control"
            description={variantA}
            views={formData.variantAViews}
            conversions={formData.variantAConversions}
            onViewsChange={(views) => setFormData({ ...formData, variantAViews: views })}
            onConversionsChange={(conversions) => setFormData({ ...formData, variantAConversions: conversions })}
            tone="control"
            disabled={loading}
          />

          {/* Variant B */}
          <VariantInput
            icon={TestTube2}
            heading="Variant B"
            tag="Treatment"
            description={variantB}
            views={formData.variantBViews}
            conversions={formData.variantBConversions}
            onViewsChange={(views) => setFormData({ ...formData, variantBViews: views })}
            onConversionsChange={(conversions) => setFormData({ ...formData, variantBConversions: conversions })}
            tone="treatment"
            disabled={loading}
          />
        </div>

        {/* Stats Preview */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-6 border border-blue-200/60 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <p className="font-semibold text-gray-900">Expected Results</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <PreviewStat
              label="Conv. Rate A"
              value={`${convRateA.toFixed(1)}%`}
              tone="control"
            />
            <PreviewStat
              label="Conv. Rate B"
              value={`${convRateB.toFixed(1)}%`}
              tone="treatment"
            />
            <PreviewStat
              label="Estimated Lift"
              value={`${lift > 0 ? '+' : ''}${lift.toFixed(1)}%`}
              tone={lift > 0 ? 'positive' : 'neutral'}
            />
          </div>

          <div className="pt-3 border-t border-blue-200/60">
            <p className="text-xs text-gray-600">
              Total events: <span className="font-semibold text-gray-900">{formData.variantAViews + formData.variantBViews}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Variant A: {formData.variantAConversions}/{formData.variantAViews} conversions • Variant B: {formData.variantBConversions}/{formData.variantBViews} conversions
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleAddEvents}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:scale-[1.02] active:scale-[0.98] font-semibold text-sm shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Adding events...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Add events
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function VariantInput({
  icon: Icon,
  heading,
  tag,
  description,
  views,
  conversions,
  onViewsChange,
  onConversionsChange,
  tone,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  heading: string;
  tag: string;
  description: string;
  views: number;
  conversions: number;
  onViewsChange: (value: number) => void;
  onConversionsChange: (value: number) => void;
  tone: 'control' | 'treatment';
  disabled?: boolean;
}) {
  const isTreatment = tone === 'treatment';
  const convRate = (conversions / views) * 100;

  return (
    <div
      className={`rounded-2xl p-5 md:p-6 border transition-all hover:-translate-y-0.5 hover:shadow-md ${
        isTreatment
          ? 'border-blue-300/60 bg-gradient-to-br from-blue-50/70 via-white/70 to-white/50'
          : 'border-gray-300 bg-white/50'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isTreatment
              ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600'
              : 'text-blue-600 bg-blue-100'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900">{heading}</p>
          <p className={`text-[10px] uppercase tracking-wider font-bold ${
            isTreatment ? 'text-blue-600' : 'text-gray-600'
          }`}>{tag}</p>
        </div>
      </div>

      <p className="text-xs text-gray-600 mb-4 line-clamp-2">{description}</p>

      {/* Input Fields */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
            Views
          </label>
          <input
            type="number"
            value={views}
            onChange={(e) => onViewsChange(parseInt(e.target.value) || 0)}
            disabled={disabled}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
            Conversions
          </label>
          <input
            type="number"
            value={conversions}
            onChange={(e) => onConversionsChange(parseInt(e.target.value) || 0)}
            disabled={disabled}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Rate Display */}
      <div className={`rounded-lg p-3 text-center transition-all ${
        isTreatment ? 'bg-blue-100/50' : 'bg-gray-100/50'
      }`}>
        <p className={`text-xs font-semibold mb-1 ${
          isTreatment ? 'text-blue-700' : 'text-gray-700'
        }`}>Conversion Rate</p>
        <p className={`text-lg font-bold ${
          isTreatment ? 'text-blue-600' : 'text-gray-900'
        }`}>{convRate.toFixed(1)}%</p>
      </div>
    </div>
  );
}

function PreviewStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'control' | 'treatment' | 'positive' | 'neutral';
}) {
  const colorMap = {
    control: 'text-blue-600',
    treatment: 'text-purple-600',
    positive: 'text-emerald-600',
    neutral: 'text-gray-600',
  };

  return (
    <div className="text-center">
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className={`text-lg font-bold ${colorMap[tone]}`}>{value}</p>
    </div>
  );
}
