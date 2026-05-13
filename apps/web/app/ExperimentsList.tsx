'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';
import { ArrowRight, Zap, Clock, CheckCircle2, Sparkles } from 'lucide-react';

interface Experiment {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  variant_a: string;
  variant_b: string;
}

interface Props {
  onSelectExperiment: (id: string) => void;
}

export function ExperimentsList({ onSelectExperiment }: Props) {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperiments();
  }, []);

  const fetchExperiments = async () => {
    try {
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExperiments(data || []);
    } catch (error) {
      console.error('Error fetching experiments:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => [
    {
      label: 'Total Experiments',
      value: experiments.length.toString(),
      icon: Zap,
      color: 'from-blue-600 to-purple-600',
    },
    {
      label: 'Active',
      value: experiments.filter(e => e.status === 'active').length.toString(),
      icon: Clock,
      color: 'from-blue-600 to-purple-600',
    },
    {
      label: 'Completed',
      value: experiments.filter(e => e.status === 'completed').length.toString(),
      icon: CheckCircle2,
      color: 'from-blue-600 to-purple-600',
    },
  ], [experiments]);

  if (loading) {
    return (
      <main className="min-h-screen pb-20">
        <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 relative overflow-hidden py-12">
          <div className="max-w-7xl mx-auto px-6 relative">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Experiments</h1>
            <p className="text-white/70 mt-2">Loading your experiments...</p>
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
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">All Experiments</h1>
              <p className="text-white/70 text-sm">Manage and monitor all your A/B tests</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 -mt-10 md:-mt-14 relative space-y-10">
        {/* Stats Grid - Smaller Cards */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <article
                key={i}
                className="bg-white p-3 md:p-4 rounded-lg shadow hover:shadow-lg hover:-translate-y-0.5 transition-all border border-gray-200"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-600 font-medium truncate">{stat.label}</p>
                    <p className="text-lg md:text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Kanban View - 2 Cards Per Row */}
        <div>
          {experiments.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200 text-center">
              <p className="text-gray-600 mb-4">No experiments yet. Create one to get started!</p>
              <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                Create Experiment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {experiments.map((experiment) => (
                <div
                  key={experiment.id}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col"
                  onClick={() => onSelectExperiment(experiment.id)}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 flex-1">{experiment.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 whitespace-nowrap ${
                        experiment.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : experiment.status === 'completed'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {experiment.status.charAt(0).toUpperCase() + experiment.status.slice(1)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 flex-1">{experiment.description}</p>

                  {/* Variants */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Variant A</p>
                      <p className="font-semibold text-gray-900 text-sm">{experiment.variant_a}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Variant B</p>
                      <p className="font-semibold text-gray-900 text-sm">{experiment.variant_b}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Created {new Date(experiment.created_at).toLocaleDateString()}
                    </p>
                    <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg active:scale-[0.98] transition-all flex items-center gap-2">
                      View
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
