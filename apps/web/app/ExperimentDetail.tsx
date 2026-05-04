'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { EditExperimentModal } from './EditExperimentModal';
import { EventRecorderModal } from './EventRecorderModal';
import { calculateStatistics } from './statisticsEngine';
import { EventsList } from './EventsList';
import { ExperimentAdvancedAnalytics } from './ExperimentAdvancedAnalytics';
import { AgentDashboard } from './AgentDashboard';
import { RealAgentDashboard } from './RealAgentDashboard';

interface ExperimentData {
  id: string;
  name: string;
  hypothesis: string;
  variant_a: string;
  variant_b: string;
  status: 'draft' | 'active' | 'completed';
  created_at: string;
}

export function ExperimentDetail({ experimentId, onBack }: {
  experimentId: string;
  onBack: () => void;
}) {
  const [experiment, setExperiment] = useState<ExperimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddEventsModal, setShowAddEventsModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'agent' | 'claude' | 'advanced' | 'events'>('overview');

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

  const handleDelete = async () => {
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
      <div className="max-w-6xl mx-auto px-4 md:px-0">
        <button
          onClick={onBack}
          className="mb-6 px-3 md:px-4 py-2 text-sm md:text-base bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold"
        >
          ← Back
        </button>
        <div className="text-center py-12">
          <p className="text-gray-600 text-base md:text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !experiment) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-0">
        <button
          onClick={onBack}
          className="mb-6 px-3 md:px-4 py-2 text-sm md:text-base bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold"
        >
          ← Back
        </button>
        <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600 text-base md:text-lg">Error: {error || 'Not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-0 space-y-4 md:space-y-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="px-3 md:px-4 py-2 text-sm md:text-base bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold"
      >
        ← Back
      </button>

      {/* Header */}
      <div className="bg-white p-4 md:p-8 rounded-lg shadow border border-gray-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 break-words">{experiment.name}</h1>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto flex-wrap">
            <button
              onClick={() => setShowAddEventsModal(true)}
              className="flex-1 md:flex-none px-3 md:px-4 py-2 text-sm md:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
            >
              📊 Record Events
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex-1 md:flex-none px-3 md:px-4 py-2 text-sm md:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
            >
              ✏️ Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 md:flex-none px-3 md:px-4 py-2 text-sm md:text-base bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:bg-gray-400 transition"
            >
              🗑️ Delete
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <span
            className={`inline-block px-3 md:px-4 py-1 md:py-2 rounded-full font-semibold text-xs md:text-sm w-fit ${
              experiment.status === 'active'
                ? 'bg-green-100 text-green-800'
                : experiment.status === 'completed'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {experiment.status.charAt(0).toUpperCase() + experiment.status.slice(1)}
          </span>
          <p className="text-xs md:text-sm text-gray-500">
            Created: {new Date(experiment.created_at).toLocaleDateString()}
          </p>
        </div>
        
        <p className="text-gray-700 text-sm md:text-lg leading-relaxed">{experiment.hypothesis}</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white p-3 md:p-4 rounded-lg shadow border border-gray-200 overflow-x-auto">
        <div className="flex gap-2 whitespace-nowrap">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'agent', label: '🤖 AI Agent' },
            { id: 'claude', label: '✨ Claude AI' },
            { id: 'advanced', label: '🚀 Advanced' },
            { id: 'events', label: '📋 Events' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 md:px-4 py-2 rounded-lg font-semibold text-xs md:text-sm transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Variant A */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 md:mb-4">Variant A</h2>
              <p className="text-gray-700 font-semibold mb-4 md:mb-6 text-sm md:text-base break-words">{experiment.variant_a}</p>

              <div className="space-y-3 md:space-y-4">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Sample Size</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">2,543</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Conversions</p>
                  <p className="text-2xl md:text-3xl font-bold text-blue-600">512</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">20.1%</p>
                </div>
              </div>
            </div>

            {/* Variant B */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 md:mb-4">Variant B</h2>
              <p className="text-gray-700 font-semibold mb-4 md:mb-6 text-sm md:text-base break-words">{experiment.variant_b}</p>

              <div className="space-y-3 md:space-y-4">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Sample Size</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">2,457</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Conversions</p>
                  <p className="text-2xl md:text-3xl font-bold text-green-600">589</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">23.9%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistical Results */}
          {stats && (
            <div className="bg-white p-4 md:p-8 rounded-lg shadow border border-gray-200 space-y-4 md:space-y-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Statistical Analysis</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
                <div className="p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs md:text-sm text-blue-700 font-semibold">Lift</p>
                  <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-2">{stats.liftPercentage > 0 ? '+' : ''}{stats.liftPercentage}%</p>
                  <p className="text-xs text-blue-600 mt-1">Variant B vs A</p>
                </div>

                <div className="p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs md:text-sm text-blue-700 font-semibold">Confidence</p>
                  <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-2">{stats.confidenceLevel}%</p>
                  <p className="text-xs text-blue-600 mt-1">Significance</p>
                </div>

                <div
                  className={`p-3 md:p-4 rounded-lg border ${
                    stats.winner === 'B'
                      ? 'bg-green-50 border-green-200'
                      : stats.winner === 'A'
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <p className="text-xs md:text-sm text-gray-700 font-semibold">Winner</p>
                  <p
                    className={`text-2xl md:text-3xl font-bold mt-2 ${
                      stats.winner === 'B'
                        ? 'text-green-600'
                        : stats.winner === 'A'
                        ? 'text-orange-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {stats.winner === 'none' ? 'TBD' : `Var ${stats.winner}`}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {stats.isSignificant ? '✓ Significant' : 'Not yet'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 md:p-6 rounded-lg border border-gray-200 space-y-3 md:space-y-4">
                <h3 className="font-semibold text-gray-800 text-sm md:text-base">Detailed Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 text-xs md:text-sm">
                  <div>
                    <p className="text-gray-600">Chi-Square:</p>
                    <p className="font-semibold text-gray-900">{stats.chiSquare}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">P-Value:</p>
                    <p className="font-semibold text-gray-900">{stats.pValue}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Conv. Rate A:</p>
                    <p className="font-semibold text-gray-900">{stats.variantA.conversionRate}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Conv. Rate B:</p>
                    <p className="font-semibold text-gray-900">{stats.variantB.conversionRate}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Sample Size:</p>
                    <p className="font-semibold text-gray-900">{(stats.recommendedSampleSize / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status:</p>
                    <p className="font-semibold text-gray-900">
                      {stats.isSignificant ? '✓ Sig' : 'Not Sig'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* AI Agent Tab */}
      {activeTab === 'agent' && stats && (
        <AgentDashboard
          experimentId={experimentId}
          variantA={experiment.variant_a}
          variantB={experiment.variant_b}
          sampleA={2543}
          convA={512}
          sampleB={2457}
          convB={589}
          pValue={stats.pValue}
          lift={stats.liftPercentage}
          daysRunning={7}
        />
      )}

      {/* Claude AI Tab */}
      {activeTab === 'claude' && stats && (
        <RealAgentDashboard
          experimentId={experimentId}
          variantA={experiment.variant_a}
          variantB={experiment.variant_b}
          sampleA={2543}
          convA={512}
          sampleB={2457}
          convB={589}
          pValue={stats.pValue}
          lift={stats.liftPercentage}
          daysRunning={7}
        />
      )}

      {/* Advanced Analytics Tab */}
      {activeTab === 'advanced' && (
        <ExperimentAdvancedAnalytics
          experimentId={experimentId}
          variantA={experiment.variant_a}
          variantB={experiment.variant_b}
        />
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <EventsList experimentId={experimentId} />
      )}

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
    </div>
  );
}
