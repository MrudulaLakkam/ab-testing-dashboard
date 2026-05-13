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
} from 'lucide-react';

type FormData = {
  name: string;
  hypothesis: string;
  variantA: string;
  variantB: string;
  description: string;
};

export function ExperimentForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    hypothesis: '',
    variantA: 'Control',
    variantB: 'Treatment',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const update =
    (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim() || !formData.hypothesis.trim()) {
      setError('Add a name and a hypothesis to continue.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: insertError } = await supabase
        .from('experiments')
        .insert([
          {
            name: formData.name,
            description: formData.description,
            hypothesis: formData.hypothesis,
            variant_a: formData.variantA,
            variant_b: formData.variantB,
            status: 'draft',
          }
        ])
        .select();

      if (insertError) throw insertError;

      setSuccess(`Experiment "${formData.name}" drafted successfully.`);
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create experiment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  const charsHyp = formData.hypothesis.length;

  return (
    <main className="min-h-screen pb-24">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 relative overflow-hidden pt-0">
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="w-full px-6 py-8 md:py-12 relative">
          <div className="max-w-3xl">
            <p className="text-white/70 text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> New experiment
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight">
              Turn a sharp <span className="italic font-light">hypothesis</span> into a
              shippable A/B test.
            </h1>
            <p className="text-white/75 mt-4 max-w-xl text-base md:text-lg">
              Name it, frame it, and define both variants. We'll handle the math when results roll in.
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 -mt-8 md:-mt-10 relative grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-6 md:p-10 shadow-lg border border-gray-200"
        >
          {/* Inline alerts */}
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 p-4 rounded-2xl border border-red-200 bg-red-50"
            >
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-900">Almost there</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mb-6 flex items-start gap-3 p-4 rounded-2xl border border-green-200 bg-green-50 animate-pulse"
            >
              <div className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-900">Draft saved</p>
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          )}

          {/* Section: Basics */}
          <SectionLabel
            step="01"
            title="The basics"
            subtitle="A clear name makes results easier to find later."
          />

          <Field
            label="Experiment name"
            required
            hint="Use the format: surface — change. Example: 'Pricing page — 3 vs 4 tier'."
          >
            <input
              type="text"
              value={formData.name}
              onChange={update('name')}
              placeholder="e.g., Homepage hero — Video vs Static"
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 transition"
            />
          </Field>

          {/* Section: Description */}
          <div className="mt-10">
            <SectionLabel
              step="02"
              title="Context"
              subtitle="Why are you running this test?"
            />
            <Field
              label="Description (optional)"
              hint="Add any additional context about this experiment."
            >
              <textarea
                value={formData.description}
                onChange={update('description')}
                rows={2}
                placeholder="e.g., We noticed lower engagement on the hero section, want to test video vs static imagery..."
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 resize-none transition"
              />
            </Field>
          </div>

          {/* Section: Hypothesis */}
          <div className="mt-10">
            <SectionLabel
              step="03"
              title="Your hypothesis"
              subtitle="If we change X for Y, we expect Z because…"
            />
            <Field
              label="Hypothesis"
              required
              hint="The strongest experiments name a metric and a magnitude."
              right={
                <span className="text-xs text-gray-500 tabular-nums">
                  {charsHyp}/280
                </span>
              }
            >
              <textarea
                value={formData.hypothesis}
                onChange={update('hypothesis')}
                rows={4}
                maxLength={280}
                placeholder="Switching the primary CTA color from blue to coral will lift homepage CTR by ~10% because it raises contrast against our hero gradient."
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 resize-none transition"
              />
            </Field>
          </div>

          {/* Section: Variants */}
          <div className="mt-10">
            <SectionLabel
              step="04"
              title="Define the variants"
              subtitle="Two arms only. Keep them surgical and isolated."
            />

            <div className="grid md:grid-cols-2 gap-4">
              <VariantCard
                tone="control"
                icon={Beaker}
                heading="Variant A"
                tag="Control"
              >
                <input
                  type="text"
                  value={formData.variantA}
                  onChange={update('variantA')}
                  placeholder="e.g., Existing blue CTA"
                  disabled={loading}
                  className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 text-sm transition"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Baseline experience your users see today.
                </p>
              </VariantCard>

              <VariantCard
                tone="treatment"
                icon={TestTube2}
                heading="Variant B"
                tag="Treatment"
              >
                <input
                  type="text"
                  value={formData.variantB}
                  onChange={update('variantB')}
                  placeholder="e.g., Coral CTA + new copy"
                  disabled={loading}
                  className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 text-sm transition"
                />
                <p className="text-xs text-gray-600 mt-2">
                  The single change you're isolating to measure impact.
                </p>
              </VariantCard>
            </div>
          </div>

          {/* Footer actions */}
          <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-gray-600">
              You can edit traffic split, metrics and audience after saving the draft.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-white border border-gray-300 px-5 py-3 rounded-xl font-semibold text-gray-700 text-sm hover:-translate-y-0.5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Create experiment
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Side rail */}
        <aside className="space-y-4">
          {/* Tips Card */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold">
                  Tips
                </p>
                <h3 className="font-bold text-gray-900">Write a sharper test</h3>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-gray-600">
              <Tip>Change one variable at a time so the signal stays clean.</Tip>
              <Tip>State the metric and the magnitude you expect to move.</Tip>
              <Tip>Pre-commit to a sample size before peeking at results.</Tip>
            </ul>
          </div>

          {/* Live Preview */}
          <div className="rounded-3xl p-6 text-white relative overflow-hidden shadow-lg bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600">
            <div
              className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 80% 30%, white 1px, transparent 1px)',
                backgroundSize: '26px 26px',
              }}
            />
            <p className="text-xs uppercase tracking-widest text-white/75 font-semibold mb-2 relative">
              Live preview
            </p>
            <h4 className="text-lg font-bold leading-snug relative">
              {formData.name || 'Untitled experiment'}
            </h4>
            <p className="text-sm text-white/80 mt-2 line-clamp-4 relative">
              {formData.hypothesis ||
                'Your hypothesis will appear here as you type — keep it concrete and measurable.'}
            </p>
            <div className="mt-5 flex gap-2 relative">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/15 backdrop-blur border border-white/20">
                A · {formData.variantA || 'Control'}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white text-blue-600">
                B · {formData.variantB || 'Treatment'}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function SectionLabel({
  step,
  title,
  subtitle,
}: {
  step: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3">
        <span
          className="text-[11px] font-bold tracking-widest text-white px-2 py-1 rounded-md bg-gradient-to-r from-blue-600 to-purple-600"
        >
          {step}
        </span>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
          {title}
        </h2>
      </div>
      <p className="text-sm text-gray-600 mt-1.5 ml-[3.25rem]">{subtitle}</p>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  right,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-gray-900">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
        {right}
      </div>
      {children}
      {hint && <p className="text-xs text-gray-600 mt-1.5">{hint}</p>}
    </div>
  );
}

function VariantCard({
  tone,
  icon: Icon,
  heading,
  tag,
  children,
}: {
  tone: 'control' | 'treatment';
  icon: React.ComponentType<{ className?: string }>;
  heading: string;
  tag: string;
  children: React.ReactNode;
}) {
  const isTreatment = tone === 'treatment';
  return (
    <div
      className={`relative rounded-2xl p-5 border transition-all hover:-translate-y-0.5 ${
        isTreatment
          ? 'border-blue-300 bg-gradient-to-br from-blue-50 via-white to-white'
          : 'border-gray-300 bg-white'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isTreatment ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600' : 'text-blue-600 bg-blue-100'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <p className="font-semibold text-gray-900">{heading}</p>
        </div>
        <span
          className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
            isTreatment ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {tag}
        </span>
      </div>
      {children}
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span
        className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600"
      />
      <span>{children}</span>
    </li>
  );
}
