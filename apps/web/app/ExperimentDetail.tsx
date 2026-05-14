'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { EditExperimentModal } from './EditExperimentModal';
import { EventRecorderModal } from './EventRecorderModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { calculateStatistics } from './statisticsEngine';
import { EventsList } from './EventsList';
import { ExperimentAdvancedAnalytics } from './ExperimentAdvancedAnalytics';
import { AgentDashboard } from './AgentDashboard';
import { RealAgentDashboard } from './RealAgentDashboard';
import {
  ArrowLeft,
  Sparkles,
  ClipboardList,
  Pencil,
  Trash2,
  Beaker,
  TestTube2,
  TrendingUp,
  Trophy,
  ShieldCheck,
  Activity,
  Bot,
  Wand2,
  Rocket,
  ListChecks,
} from 'lucide-react';

interface ExperimentData {
  id: string;
  name: string;
  hypothesis: string;
  variant_a: string;
  variant_b: string;
  status: 'draft' | 'active' | 'completed';
  created_at: string;
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'agent', label: 'AI Agent', icon: Bot },
  { id: 'claude', label: 'Claude AI', icon: Wand2 },
  { id: 'advanced', label: 'Advanced', icon: Rocket },
  { id: 'events', label: 'Events', icon: ListChecks },
] as const;

type TabId = (typeof tabs)[number]['id'];

export function ExperimentDetail({ experimentId, onBack }: {
  experimentId: string;
  onBack: () => void;
}) {
  const [experiment, setExperiment] = useState<ExperimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddEventsModal, setShowAddEventsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  useEffect(() => {
    fetchExperiment();
  }, [experimentId]);

  useEffect(() => {
    if (experiment) {
      const results = calculateStatistics(2543, 512, 2457, 589);
      setStats(results);
    }
  }, [experiment]);

  const fetchExperiment = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('experiments')
        .select('*')
        .eq('id', experimentId)
        .single();

      if (fetchError) throw fetchError;

      setExperiment(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load experiment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExperiment = async () => {
    if (!window.confirm('Delete this experiment? This action cannot be undone.')) return;

    setDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from('experiments')
        .delete()
        .eq('id', experimentId);

      if (deleteError) throw deleteError;

      alert('Experiment deleted!');
      onBack();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen pb-24">
        <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 relative overflow-hidden py-12">
          <div className="max-w-7xl mx-auto px-6 relative">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Loading experiment...</h1>
          </div>
        </header>
      </main>
    );
  }

  if (error || !experiment) {
    return (
      <main className="min-h-screen pb-24">
        <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 relative overflow-hidden py-12">
          <div className="max-w-7xl mx-auto px-6 relative">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 backdrop-blur text-white hover:bg-white/30 transition-all font-semibold mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Error loading experiment</h1>
            <p className="text-white/70 mt-2">{error || 'Not found'}</p>
          </div>
        </header>
      </main>
    );
  }

  const sampleA = 2543;
  const convA = 512;
  const sampleB = 2457;
  const convB = 589;
  const rateA = (convA / sampleA) * 100;
  const rateB = (convB / sampleB) * 100;
  const lift = ((rateB - rateA) / rateA) * 100;
  const confidence = stats?.confidenceLevel || 97.4;
  const isSignificant = confidence >= 95;
  const winner = isSignificant ? (rateB > rateA ? 'B' : 'A') : 'none';

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
              onClick={onBack}
              className="bg-white/20 backdrop-blur inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white/90 hover:text-white transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to experiments
            </button>
            <span className="bg-white/20 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-white/90 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${experiment.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-300'}`} />
              {experiment.status === 'active' ? 'Live experiment' : experiment.status.charAt(0).toUpperCase() + experiment.status.slice(1)}
            </span>
          </div>

          <div className="max-w-3xl">
            <p className="text-white/70 text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Experiment detail
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight">
              {experiment.name}
            </h1>
            <p className="text-white/75 mt-4 max-w-xl text-base md:text-lg">
              {experiment.hypothesis}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <StatusPill status={experiment.status} />
              <span className="text-white/70 text-xs">
                Created {new Date(experiment.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 -mt-10 md:-mt-14 relative space-y-8">
        {/* Action bar */}
        <section className="bg-white/80 backdrop-blur rounded-3xl p-5 md:p-6 shadow-lg border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-1">
              Quick actions
            </p>
            <h2 className="text-lg md:text-xl font-bold text-gray-900">
              Move the experiment forward
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowAddEventsModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all"
            >
              <ClipboardList className="w-4 h-4" /> Record events
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-white/80 backdrop-blur text-gray-900 px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:-translate-y-0.5 transition-all border border-gray-200"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={deleting}
              className="px-4 py-2.5 rounded-xl font-semibold text-sm text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" /> Delete events
            </button>
          </div>
        </section>

        {/* Tabs */}
        <nav className="bg-white/80 backdrop-blur rounded-2xl p-1.5 inline-flex flex-wrap gap-1 max-w-full overflow-x-auto border border-gray-200">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Variants grid */}
            <div className="grid md:grid-cols-2 gap-5">
              <VariantPanel
                tone="control"
                icon={Beaker}
                heading="Variant A"
                tag="Control"
                description={experiment.variant_a}
                sample={sampleA}
                conversions={convA}
                rate={rateA}
              />
              <VariantPanel
                tone="treatment"
                icon={TestTube2}
                heading="Variant B"
                tag="Treatment"
                description={experiment.variant_b}
                sample={sampleB}
                conversions={convB}
                rate={rateB}
                isWinner={winner === 'B'}
              />
            </div>

            {/* Statistical analysis */}
            {stats && (
              <section className="bg-white/80 backdrop-blur rounded-3xl p-6 md:p-8 shadow-lg border border-gray-200 space-y-6">
                <div className="flex items-end justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-1 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5" /> Statistical analysis
                    </p>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                      The numbers behind the call
                    </h3>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                      isSignificant
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {isSignificant ? 'Significant result' : 'Not yet significant'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <KpiCard
                    icon={TrendingUp}
                    label="Lift"
                    value={`${lift > 0 ? '+' : ''}${lift.toFixed(1)}%`}
                    caption="Variant B vs A"
                  />
                  <KpiCard
                    icon={ShieldCheck}
                    label="Confidence"
                    value={`${confidence}%`}
                    caption="Statistical significance"
                  />
                  <KpiCard
                    icon={Trophy}
                    label="Winner"
                    value={winner === 'none' ? 'TBD' : `Variant ${winner}`}
                    caption={isSignificant ? 'Ready to ship' : 'Keep collecting data'}
                    highlight={isSignificant}
                  />
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white/50 p-5 md:p-6">
                  <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-4">
                    Detailed statistics
                  </p>
                  <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                    <Stat label="Chi-Square" value={stats.chiSquare} />
                    <Stat label="P-Value" value={stats.pValue} />
                    <Stat label="Conv. Rate A" value={`${rateA.toFixed(2)}%`} />
                    <Stat label="Conv. Rate B" value={`${rateB.toFixed(2)}%`} />
                    <Stat label="Recommended N" value="5K" />
                    <Stat
                      label="Status"
                      value={isSignificant ? 'Significant' : 'Not significant'}
                    />
                  </dl>
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === 'agent' && stats && (
          <AgentDashboard
            experimentId={experimentId}
            variantA={experiment.variant_a}
            variantB={experiment.variant_b}
            sampleA={sampleA}
            convA={convA}
            sampleB={sampleB}
            convB={convB}
            pValue={stats.pValue}
            lift={lift}
            daysRunning={7}
          />
        )}

        {activeTab === 'claude' && stats && (
          <RealAgentDashboard
            experimentId={experimentId}
            variantA={experiment.variant_a}
            variantB={experiment.variant_b}
            sampleA={sampleA}
            convA={convA}
            sampleB={sampleB}
            convB={convB}
            pValue={stats.pValue}
            lift={lift}
            daysRunning={7}
          />
        )}

        {activeTab === 'advanced' && (
          <ExperimentAdvancedAnalytics
            experimentId={experimentId}
            variantA={experiment.variant_a}
            variantB={experiment.variant_b}
          />
        )}

        {activeTab === 'events' && (
          <EventsList experimentId={experimentId} />
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && experiment && (
        <EditExperimentModal
          experiment={experiment}
          onClose={() => setShowEditModal(false)}
          onUpdate={fetchExperiment}
        />
      )}

      {/* Event Recorder Modal */}
      {showAddEventsModal && experiment && (
        <EventRecorderModal
          experimentId={experimentId}
          variantA={experiment.variant_a}
          variantB={experiment.variant_b}
          onClose={() => setShowAddEventsModal(false)}
          onSuccess={fetchExperiment}
        />
      )}

      {/* Delete Confirm Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          experimentId={experimentId}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={fetchExperiment}
        />
      )}
    </main>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === 'active'
      ? 'bg-emerald-400/20 text-emerald-50 border-emerald-300/40'
      : status === 'completed'
        ? 'bg-blue-400/20 text-blue-50 border-blue-300/40'
        : 'bg-white/15 text-white/80 border-white/20';
  return (
    <span
      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border backdrop-blur ${tone}`}
    >
      {status}
    </span>
  );
}

function VariantPanel({
  tone,
  icon: Icon,
  heading,
  tag,
  description,
  sample,
  conversions,
  rate,
  isWinner,
}: {
  tone: 'control' | 'treatment';
  icon: React.ComponentType<{ className?: string }>;
  heading: string;
  tag: string;
  description: string;
  sample: number;
  conversions: number;
  rate: number;
  isWinner?: boolean;
}) {
  const isTreatment = tone === 'treatment';
  return (
    <article
      className={`relative rounded-3xl p-6 md:p-7 border shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl ${
        isTreatment
          ? 'border-blue-300/60 bg-gradient-to-br from-blue-50/70 via-white/70 to-white/50'
          : 'border-gray-200 bg-white/80 backdrop-blur'
      }`}
    >
      {isWinner && (
        <span className="absolute -top-3 right-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
          <Trophy className="w-3 h-3" /> Winner
        </span>
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isTreatment
                ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600'
                : 'text-blue-600 bg-blue-100'
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg leading-none">{heading}</p>
            <span
              className={`text-[10px] uppercase tracking-wider font-bold ${
                isTreatment ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              {tag}
            </span>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-6 leading-relaxed">{description}</p>

      <dl className="grid grid-cols-3 gap-3">
        <MetricCell label="Sample" value={sample.toLocaleString()} />
        <MetricCell
          label="Conversions"
          value={conversions.toLocaleString()}
          accent={isTreatment ? 'treatment' : 'control'}
        />
        <MetricCell label="Rate" value={`${rate.toFixed(1)}%`} />
      </dl>
    </article>
  );
}

function MetricCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'control' | 'treatment';
}) {
  return (
    <div className="rounded-xl bg-white/60 border border-gray-200/60 p-3">
      <p className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold">
        {label}
      </p>
      <p
        className={`mt-1 text-xl md:text-2xl font-bold tabular-nums leading-none ${
          accent === 'treatment'
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
            : accent === 'control'
              ? 'text-blue-600'
              : 'text-gray-900'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  caption,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  caption: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl p-5 border transition-all hover:-translate-y-0.5 ${
        highlight
          ? 'border-emerald-300/60 bg-emerald-50/70'
          : 'border-gray-200 bg-white/60'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider font-semibold text-gray-600">
          {label}
        </span>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
            highlight ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-purple-600'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p
        className={`text-3xl md:text-4xl font-bold tracking-tight tabular-nums leading-none ${
          highlight
            ? 'text-emerald-700'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-gray-600 mt-2">{caption}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-600">{label}</dt>
      <dd className="font-bold text-gray-900 tabular-nums mt-0.5">{value}</dd>
    </div>
  );
}
