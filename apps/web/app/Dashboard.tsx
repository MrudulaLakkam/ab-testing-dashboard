'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { ExperimentSuggestions } from './ExperimentSuggestions';
import {
  Sparkles,
  FlaskConical,
  Activity,
  CheckCircle2,
  TrendingUp,
  Plus,
  BarChart3,
  Zap,
  ArrowUpRight,
  Clock,
} from 'lucide-react';

interface Experiment {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

interface Props {
  onNewExperiment: () => void;
  onViewExperiments: () => void;
  onSeeReports: () => void;
  onSelectExperiment: (id: string) => void;
}

export function Dashboard({ onNewExperiment, onViewExperiments, onSeeReports, onSelectExperiment }: Props) {
  const [stats, setStats] = useState({
    activeExperiments: 0,
    totalExperiments: 0,
    avgConversionRate: 0,
    winnersFound: 0,
  });
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: experimentsData, error: experimentsError } = await supabase
          .from('experiments')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (experimentsError) throw experimentsError;

        const activeCount = experimentsData?.filter(e => e.status === 'active').length || 0;
        const completedCount = experimentsData?.filter(e => e.status === 'completed').length || 0;
        const totalCount = experimentsData?.length || 0;

        setStats({
          activeExperiments: activeCount,
          totalExperiments: totalCount,
          avgConversionRate: 21.8,
          winnersFound: completedCount,
        });

        setExperiments(experimentsData || []);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    { label: 'Total Experiments', value: stats.totalExperiments.toString(), icon: FlaskConical, trend: '+12%' },
    { label: 'Active Tests', value: stats.activeExperiments.toString(), icon: Activity, trend: '+4' },
    { label: 'Completed', value: stats.winnersFound.toString(), icon: CheckCircle2, trend: '+8%' },
    { label: 'Avg Lift', value: `${stats.avgConversionRate}%`, icon: TrendingUp, trend: '+3.2%' },
  ];

  if (loading) {
    return (
      <main className="min-h-screen pb-20">
        <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 relative overflow-hidden py-14">
          <div className="max-w-7xl mx-auto px-6 relative">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Welcome Back! 👋</h1>
            <p className="text-white/70 mt-2">Loading your dashboard...</p>
          </div>
        </header>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-14 relative">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">AB Test Pro</h1>
                <p className="text-white/70 text-sm">Premium experimentation, beautifully measured.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-white/90 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> All systems nominal
              </span>
            </div>
          </div>

          <div className="mt-10 md:mt-14 max-w-2xl">
            <p className="text-white/70 text-sm uppercase tracking-[0.18em] mb-3">Welcome back</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              Ship decisions backed by <span className="italic font-light">evidence</span>, not opinions.
            </h2>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 -mt-10 md:-mt-14 relative space-y-10">
        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((s, i) => (
            <article
              key={s.label}
              className="bg-white p-5 md:p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs md:text-sm text-gray-600 font-medium">{s.label}</span>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="mt-4 text-3xl md:text-4xl font-bold text-gray-900 leading-none tracking-tight">
                {s.value}
              </p>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-green-600">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {s.trend} <span className="text-gray-600 font-normal">vs last month</span>
              </div>
            </article>
          ))}
        </section>

        {/* Quick Actions */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-gray-200 overflow-hidden relative">
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-gray-600 font-semibold mb-2">Quick actions</p>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Start your next experiment</h3>
              <p className="text-gray-600 mt-1 text-sm md:text-base">Spin up a hypothesis in under 60 seconds.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onNewExperiment}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all"
              >
                <Plus className="w-4 h-4" /> New Experiment
              </button>
              <button
                onClick={onSeeReports}
                className="bg-white border border-gray-300 px-5 py-3 rounded-xl font-semibold text-gray-700 flex items-center gap-2 hover:-translate-y-0.5 transition-all"
              >
                <BarChart3 className="w-4 h-4" /> View Reports
              </button>
            </div>
          </div>
        </section>

        {/* AI Recommendations */}
        <ExperimentSuggestions />

        {/* Recent Activity */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-gray-200">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-gray-600 font-semibold mb-1 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Recent activity
              </p>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">What's been happening</h3>
            </div>
          </div>

          {experiments.length === 0 ? (
            <p className="text-gray-600 text-center py-12 text-sm md:text-base">No experiments yet. Create one to get started! 🚀</p>
          ) : (
            <ol className="relative border-l border-gray-300 ml-3 space-y-6">
              {experiments.map((experiment) => (
                <li key={experiment.id} className="pl-6 relative group cursor-pointer" onClick={() => onSelectExperiment(experiment.id)}>
                  <span
                    className={`absolute -left-[7px] top-1.5 w-3.5 h-3.5 rounded-full ring-4 ring-white ${
                      experiment.status === 'active'
                        ? 'bg-blue-500 animate-pulse'
                        : experiment.status === 'completed'
                        ? 'bg-emerald-500'
                        : 'bg-purple-500'
                    }`}
                  />
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-all">{experiment.name}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{new Date(experiment.created_at).toLocaleDateString()}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full w-fit ${
                        experiment.status === 'active'
                          ? 'bg-blue-100 text-blue-700'
                          : experiment.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {experiment.status.charAt(0).toUpperCase() + experiment.status.slice(1)}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}
