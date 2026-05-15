'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabaseClient';
import {
  Sparkles,
  FlaskConical,
  Lightbulb,
  Beaker,
  TestTube2,
  CheckCircle2,
  Loader2,
  Wand2,
  ArrowLeft,
  AlertCircle,
  Target,
  Users,
  Settings,
  Check,
} from 'lucide-react';
import {
  calculateSampleSize,
  estimateExperimentDuration,
  validateTrafficSplit,
  generateHypothesis,
  PRIMARY_METRICS,
  SECONDARY_METRICS,
  AUDIENCE_OPTIONS,
  CONFIDENCE_LEVELS,
} from './experimentUtils';
import type { ExperimentFormData } from './types/experiment';

type FormStep = 'goal' | 'audience' | 'setup' | 'configuration' | 'review';

const STEPS: { id: FormStep; label: string; icon: any }[] = [
  { id: 'goal', label: 'Goal', icon: Target },
  { id: 'audience', label: 'Audience', icon: Users },
  { id: 'setup', label: 'Setup', icon: Beaker },
  { id: 'configuration', label: 'Configuration', icon: Settings },
  { id: 'review', label: 'Review', icon: Check },
];

export function ExperimentForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FormStep>('goal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdExperiment, setCreatedExperiment] = useState<any>(null);

  const [formData, setFormData] = useState<ExperimentFormData>({
    name: '',
    primaryMetric: 'conversion',
    secondaryMetrics: [],
    audience: 'all_users',
    hypothesis: '',
    variantA: 'Control',
    variantB: 'Treatment',
    description: '',
    trafficAllocationA: 50,
    trafficAllocationB: 50,
    expectedLift: 10,
    confidenceLevel: 95,
  });

  const handleChange = (field: keyof ExperimentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSecondaryMetricsChange = (metric: string) => {
    setFormData(prev => ({
      ...prev,
      secondaryMetrics: prev.secondaryMetrics.includes(metric as any)
        ? prev.secondaryMetrics.filter(m => m !== metric)
        : [...prev.secondaryMetrics, metric as any],
    }));
  };

  const handleTrafficChange = (variant: 'A' | 'B', value: number) => {
    const maxValue = 100;
    const clampedValue = Math.max(0, Math.min(maxValue, value));
    const otherValue = maxValue - clampedValue;

    setFormData(prev => ({
      ...prev,
      [`trafficAllocation${variant}`]: clampedValue,
      [`trafficAllocation${variant === 'A' ? 'B' : 'A'}`]: otherValue,
    }));
  };

  const generateAutoHypothesis = () => {
    const hypothesis = generateHypothesis(
      formData.name,
      formData.primaryMetric,
      formData.expectedLift
    );
    handleChange('hypothesis', hypothesis);
  };

  const validateStep = (step: FormStep): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    switch (step) {
      case 'goal':
        if (!formData.name.trim()) errors.push('Experiment name is required');
        if (!formData.primaryMetric) errors.push('Primary metric is required');
        break;

      case 'setup':
        if (!formData.hypothesis.trim()) errors.push('Hypothesis is required');
        if (!formData.variantA.trim()) errors.push('Variant A is required');
        if (!formData.variantB.trim()) errors.push('Variant B is required');
        break;

      case 'configuration':
        if (formData.expectedLift > 30) {
          errors.push('⚠️ Expected lift > 30% is unrealistic. Please reconsider.');
        }
        const trafficValidation = validateTrafficSplit(
          formData.trafficAllocationA,
          formData.trafficAllocationB
        );
        if (!trafficValidation.isValid) {
          errors.push(trafficValidation.error || 'Traffic allocation must equal 100%');
        }
        break;
    }

    return { valid: errors.length === 0, errors };
  };

  const handleNext = () => {
    const validation = validateStep(currentStep);
    if (!validation.valid) {
      setError(validation.errors.join('\n'));
      return;
    }
    setError('');

    const stepIndex = STEPS.findIndex(s => s.id === currentStep);
    if (stepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[stepIndex + 1].id);
    }
  };

  const handlePrev = () => {
    const stepIndex = STEPS.findIndex(s => s.id === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(STEPS[stepIndex - 1].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || loading) {
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    setError('');

    const validation = validateStep('configuration');
    if (!validation.valid) {
      setError(validation.errors.join('\n'));
      setIsSubmitting(false);
      setLoading(false);
      return;
    }

    try {
      const insertData: any = {
        name: formData.name,
        description: formData.description,
        hypothesis: formData.hypothesis,
        variant_a: formData.variantA,
        variant_b: formData.variantB,
        status: 'draft',
        primary_metric: formData.primaryMetric,
        secondary_metrics: formData.secondaryMetrics,
        audience: formData.audience,
        traffic_split: {
          variant_a: formData.trafficAllocationA,
          variant_b: formData.trafficAllocationB,
        },
        expected_lift: formData.expectedLift,
        confidence_level: formData.confidenceLevel,
      };

      const { data, error: insertError } = await supabase
        .from('experiments')
        .insert([insertData])
        .select();

      if (insertError) {
        if (insertError.message.includes('column')) {
          throw new Error(
            `Database schema issue: ${insertError.message}\n\nPlease run the Supabase migration to add the new columns.`
          );
        }
        throw insertError;
      }

      if (data && data.length > 0) {
        setCreatedExperiment(data[0]);
        setShowSuccessModal(true);
      }

      setLoading(false);
      setIsSubmitting(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create experiment');
      console.error('Submission error:', err);
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isSubmitting || loading) return;
    router.push('/');
  };

  const handleBackToDashboard = () => {
    router.push('/');
  };

  const sampleSize = calculateSampleSize(
    formData.expectedLift,
    formData.confidenceLevel,
    0.2
  );

  const estimatedDays = estimateExperimentDuration(
    sampleSize,
    formData.trafficAllocationA
  );

  // SHOW SUCCESS MODAL
  if (showSuccessModal && createdExperiment) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full space-y-6 border border-gray-200 max-h-[90vh] overflow-y-auto p-8">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">
              Experiment Created! 🎉
            </h2>
            <p className="text-gray-600">
              Your experiment is ready to go
            </p>
          </div>

          {/* Experiment Details */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 space-y-4 border border-blue-200">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-1">
                Experiment Name
              </p>
              <p className="text-lg font-bold text-gray-900">
                {createdExperiment.name}
              </p>
            </div>

            <div className="border-t border-blue-200 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Primary Metric</p>
                <p className="text-sm font-semibold text-gray-900">
                  {PRIMARY_METRICS.find(m => m.value === createdExperiment.primary_metric)?.label || 'N/A'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Audience</p>
                <p className="text-sm font-semibold text-gray-900">
                  {AUDIENCE_OPTIONS.find(a => a.value === createdExperiment.audience)?.label || 'N/A'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Status</p>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wide">
                  Draft
                </span>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Traffic Split</p>
                <p className="text-sm font-semibold text-gray-900">
                  {createdExperiment.traffic_split?.variant_a || 50}% / {createdExperiment.traffic_split?.variant_b || 50}%
                </p>
              </div>
            </div>
          </div>

          {/* Stats Preview */}
          <div className="bg-blue-50 rounded-2xl p-4 space-y-3">
            <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold">
              Quick Stats
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Sample Size</p>
                <p className="text-sm font-bold text-gray-900">
                  ~{sampleSize.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Duration</p>
                <p className="text-sm font-bold text-gray-900">
                  {estimatedDays}d
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Expected Lift</p>
                <p className="text-sm font-bold text-gray-900">
                  +{createdExperiment.expected_lift}%
                </p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-amber-50 rounded-2xl p-4 space-y-2 border border-amber-200">
            <p className="text-sm font-semibold text-amber-900">💡 Next Steps</p>
            <ul className="text-xs text-amber-800 space-y-1">
              <li>✓ Configure your traffic allocation in the experiment settings</li>
              <li>✓ Record test events to start analyzing</li>
              <li>✓ Monitor results daily for statistical significance</li>
            </ul>
          </div>

          {/* Button */}
          <button
            onClick={handleBackToDashboard}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:scale-[1.02] active:scale-[0.98] font-semibold text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-24">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="w-full px-6 py-10 md:py-14 relative">
          <div className="flex items-center justify-between gap-6 flex-wrap mb-8">
            <button
              onClick={handleCancel}
              disabled={isSubmitting || loading}
              className="bg-white/20 backdrop-blur inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white/90 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span className="bg-white/20 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-white/90">
              Step {STEPS.findIndex(s => s.id === currentStep) + 1} of {STEPS.length}
            </span>
          </div>

          <div className="max-w-3xl">
            <p className="text-white/70 text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Experiment builder
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight">
              Create a data-driven experiment
            </h1>
            <p className="text-white/75 mt-4 max-w-xl text-base md:text-lg">
              Set clear goals, define your audience, and let statistics guide your decisions.
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 -mt-10 md:-mt-14 relative space-y-8">
        {/* Progress Indicator */}
        <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between overflow-x-auto gap-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = STEPS.findIndex(s => s.id === currentStep) > index;

              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <button
                    onClick={() => !loading && !isSubmitting && setCurrentStep(step.id)}
                    disabled={loading || isSubmitting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{step.label}</span>
                  </button>

                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-1 w-8 mx-1 rounded-full flex-shrink-0 ${
                        isCompleted ? 'bg-emerald-300' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl border border-red-200 bg-red-50">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900">Validation Error</p>
              <p className="text-sm text-red-700 mt-1 whitespace-pre-line">{error}</p>
            </div>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Goal */}
          {currentStep === 'goal' && (
            <div className="bg-white/80 backdrop-blur rounded-3xl p-6 md:p-10 shadow-lg border border-gray-200 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Step 1: Define Your Goal
                </p>
                <h2 className="text-2xl font-bold text-gray-900">What are you testing?</h2>
              </div>

              {/* Experiment Name */}
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Experiment Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Pricing page — 3 tier vs 4 tier"
                  disabled={loading || isSubmitting}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Use format: surface — change (e.g., Homepage CTA — Blue vs Red)
                </p>
              </div>

              {/* Primary Metric */}
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Primary Metric *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {PRIMARY_METRICS.map((metric) => (
                    <button
                      key={metric.value}
                      type="button"
                      onClick={() => !loading && !isSubmitting && handleChange('primaryMetric', metric.value)}
                      disabled={loading || isSubmitting}
                      className={`p-3 rounded-xl border-2 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                        formData.primaryMetric === metric.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold text-sm text-gray-900">{metric.label}</p>
                      <p className="text-xs text-gray-600 mt-1">{metric.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary Metrics */}
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Secondary Metrics (Optional)
                </label>
                <div className="space-y-2">
                  {SECONDARY_METRICS.map((metric) => (
                    <label
                      key={metric.value}
                      className={`flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition ${
                        loading || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.secondaryMetrics.includes(metric.value)}
                        onChange={() => !loading && !isSubmitting && handleSecondaryMetricsChange(metric.value)}
                        disabled={loading || isSubmitting}
                        className="w-4 h-4 rounded disabled:opacity-50"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{metric.label}</p>
                        <p className="text-xs text-gray-600">{metric.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Audience */}
          {currentStep === 'audience' && (
            <div className="bg-white/80 backdrop-blur rounded-3xl p-6 md:p-10 shadow-lg border border-gray-200 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Step 2: Target Your Audience
                </p>
                <h2 className="text-2xl font-bold text-gray-900">Who will see this experiment?</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AUDIENCE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => !loading && !isSubmitting && handleChange('audience', option.value)}
                    disabled={loading || isSubmitting}
                    className={`p-4 rounded-xl border-2 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                      formData.audience === option.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-gray-900">{option.label}</p>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Experiment Setup */}
          {currentStep === 'setup' && (
            <div className="bg-white/80 backdrop-blur rounded-3xl p-6 md:p-10 shadow-lg border border-gray-200 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-2 flex items-center gap-2">
                  <Beaker className="w-4 h-4" /> Step 3: Experiment Setup
                </p>
                <h2 className="text-2xl font-bold text-gray-900">Define your variants</h2>
              </div>

              {/* Hypothesis */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Hypothesis *
                  </label>
                  <button
                    type="button"
                    onClick={generateAutoHypothesis}
                    disabled={loading || isSubmitting || !formData.name}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Wand2 className="w-3 h-3" /> Generate
                  </button>
                </div>
                <textarea
                  value={formData.hypothesis}
                  onChange={(e) => handleChange('hypothesis', e.target.value)}
                  disabled={loading || isSubmitting}
                  rows={3}
                  placeholder="If we change X for Y, we expect Z because..."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 resize-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Variants */}
              <div className="grid md:grid-cols-2 gap-6">
                <VariantCard
                  icon={Beaker}
                  heading="Variant A"
                  tag="Control"
                  value={formData.variantA}
                  onChange={(v) => handleChange('variantA', v)}
                  tone="control"
                  disabled={loading || isSubmitting}
                />
                <VariantCard
                  icon={TestTube2}
                  heading="Variant B"
                  tag="Treatment"
                  value={formData.variantB}
                  onChange={(v) => handleChange('variantB', v)}
                  tone="treatment"
                  disabled={loading || isSubmitting}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  disabled={loading || isSubmitting}
                  rows={2}
                  placeholder="Add context about this experiment..."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 resize-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          )}

          {/* Step 4: Configuration */}
          {currentStep === 'configuration' && (
            <div className="bg-white/80 backdrop-blur rounded-3xl p-6 md:p-10 shadow-lg border border-gray-200 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-2 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Step 4: Configuration
                </p>
                <h2 className="text-2xl font-bold text-gray-900">Fine-tune your experiment</h2>
              </div>

              {/* Traffic Allocation */}
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-4 block">
                  Traffic Allocation
                </label>
                <div className="space-y-4">
                  <TrafficSlider
                    variantA={formData.trafficAllocationA}
                    variantB={formData.trafficAllocationB}
                    onChangeA={(v) => !loading && !isSubmitting && handleTrafficChange('A', v)}
                    onChangeB={(v) => !loading && !isSubmitting && handleTrafficChange('B', v)}
                    disabled={loading || isSubmitting}
                  />
                </div>
              </div>

              {/* Expected Lift */}
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Expected Lift (%) *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={formData.expectedLift}
                    onChange={(e) => !loading && !isSubmitting && handleChange('expectedLift', parseInt(e.target.value))}
                    disabled={loading || isSubmitting}
                    className="flex-1 disabled:opacity-50"
                  />
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.expectedLift}
                    onChange={(e) => !loading && !isSubmitting && handleChange('expectedLift', parseInt(e.target.value))}
                    disabled={loading || isSubmitting}
                    className="w-16 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm font-semibold text-gray-900">%</span>
                </div>
              </div>

              {/* Confidence Level */}
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-3 block">
                  Confidence Level *
                </label>
                <div className="space-y-2">
                  {CONFIDENCE_LEVELS.map((level) => (
                    <label
                      key={level.value}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        loading || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      style={{
                        borderColor: formData.confidenceLevel === level.value ? '#2563eb' : '#e5e7eb',
                        backgroundColor: formData.confidenceLevel === level.value ? '#eff6ff' : 'white',
                      }}
                    >
                      <input
                        type="radio"
                        name="confidence"
                        checked={formData.confidenceLevel === level.value}
                        onChange={() => !loading && !isSubmitting && handleChange('confidenceLevel', level.value)}
                        disabled={loading || isSubmitting}
                        className="w-4 h-4 disabled:opacity-50"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{level.label}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{level.description}</p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700">
                        {level.riskLevel} Risk
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-white/80 backdrop-blur rounded-3xl p-6 md:p-10 shadow-lg border border-gray-200 space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-2 flex items-center gap-2">
                    <Check className="w-4 h-4" /> Step 5: Review & Launch
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900">Ready to launch?</h2>
                </div>

                {/* Experiment Summary */}
                <div className="space-y-4">
                  <SummaryItem
                    label="Experiment"
                    value={formData.name}
                  />
                  <SummaryItem
                    label="Primary Metric"
                    value={PRIMARY_METRICS.find(m => m.value === formData.primaryMetric)?.label || ''}
                  />
                  <SummaryItem
                    label="Target Audience"
                    value={AUDIENCE_OPTIONS.find(a => a.value === formData.audience)?.label || ''}
                  />
                  <SummaryItem
                    label="Traffic Split"
                    value={`${formData.trafficAllocationA}% / ${formData.trafficAllocationB}%`}
                  />
                </div>
              </div>

              {/* Statistics Card */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-6 md:p-8 shadow-lg border border-blue-200 space-y-6">
                <h3 className="text-lg font-bold text-gray-900">📊 Experiment Statistics</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard
                    label="Sample Size"
                    value={`~${sampleSize.toLocaleString()}`}
                    description="Per variant needed"
                  />
                  <StatCard
                    label="Estimated Duration"
                    value={`${estimatedDays} days`}
                    description="At current traffic"
                  />
                  <StatCard
                    label="Expected Lift"
                    value={`+${formData.expectedLift}%`}
                    description={`${formData.confidenceLevel}% confidence`}
                  />
                </div>
              </div>

              {/* Tips */}
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 space-y-2">
                <p className="text-sm font-semibold text-amber-900">💡 Tips for Success</p>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>✓ Ensure sufficient traffic for your target sample size</li>
                  <li>✓ Run the experiment for at least 1 week to account for weekly patterns</li>
                  <li>✓ Monitor for anomalies and external factors that could skew results</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 'goal' || loading || isSubmitting}
              className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            {currentStep !== 'review' ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={loading || isSubmitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:scale-[1.02] active:scale-[0.98] font-semibold text-sm shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:scale-[1.02] active:scale-[0.98] font-semibold text-sm shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading || isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Create Experiment
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

// Helper Components

function VariantCard({
  icon: Icon,
  heading,
  tag,
  value,
  onChange,
  tone,
  disabled,
}: {
  icon: any;
  heading: string;
  tag: string;
  value: string;
  onChange: (v: string) => void;
  tone: 'control' | 'treatment';
  disabled?: boolean;
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
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={`e.g., ${heading === 'Variant A' ? 'Existing blue CTA' : 'Coral CTA + new copy'}`}
        className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

function TrafficSlider({
  variantA,
  variantB,
  onChangeA,
  onChangeB,
  disabled,
}: {
  variantA: number;
  variantB: number;
  onChangeA: (v: number) => void;
  onChangeB: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* Visual Representation */}
      <div className="flex gap-2 h-8 rounded-xl overflow-hidden bg-gray-200">
        <div
          className="bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold transition-all"
          style={{ width: `${variantA}%` }}
        >
          {variantA > 15 && `${variantA}%`}
        </div>
        <div
          className="bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold transition-all"
          style={{ width: `${variantB}%` }}
        >
          {variantB > 15 && `${variantB}%`}
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
            Variant A
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={variantA}
            onChange={(e) => onChangeA(parseInt(e.target.value) || 0)}
            disabled={disabled}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
            Variant B
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={variantB}
            onChange={(e) => onChangeB(parseInt(e.target.value) || 0)}
            disabled={disabled}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {variantA + variantB === 100 ? (
        <p className="text-xs text-emerald-600 font-semibold">✓ Traffic split valid</p>
      ) : (
        <p className="text-xs text-red-600 font-semibold">
          ✗ Total must be 100% (current: {variantA + variantB}%)
        </p>
      )}
    </div>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl p-4 bg-white/60 border border-blue-200 text-center">
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600 mt-1">{description}</p>
    </div>
  );
}
