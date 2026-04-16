'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { EditExperimentModal } from './EditExperimentModal';

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
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchExperiment();
  }, [experimentId]);

  const fetchExperiment = async () => {
    setLoading(true);
    try {
      console.log('Fetching experiment:', experimentId);
      
      const { data, error: fetchError } = await supabase
        .from('experiments')
        .select('*')
        .eq('id', experimentId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      console.log('Experiment loaded:', data);
      setExperiment(data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching experiment:', err);
      setError(err.message || 'Failed to load experiment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this experiment? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from('experiments')
        .delete()
        .eq('id', experimentId);

      if (deleteError) {
        throw deleteError;
      }

      console.log('Experiment deleted:', experimentId);
      alert('Experiment deleted successfully!');
      onBack();
    } catch (err: any) {
      alert('Error deleting experiment: ' + err.message);
      console.error('Error:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold"
        >
          ← Back to Experiments
        </button>
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Loading experiment details...</p>
        </div>
      </div>
    );
  }

  if (error || !experiment) {
    return (
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold"
        >
          ← Back to Experiments
        </button>
        <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600 text-lg">Error: {error || 'Experiment not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold"
      >
        ← Back to Experiments
      </button>

      {/* Header with Actions */}
      <div className="bg-white p-8 rounded-lg shadow border border-gray-200 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-gray-900">{experiment.name}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              ✏️ Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting...' : '🗑️ Delete'}
            </button>
          </div>
        </div>
        
        <span className={`inline-block px-4 py-2 rounded-full font-semibold mb-4 ${
          experiment.status === 'active' ? 'bg-green-100 text-green-800' :
          experiment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {experiment.status.charAt(0).toUpperCase() + experiment.status.slice(1)}
        </span>
        
        <p className="text-gray-700 text-lg mt-4">{experiment.hypothesis}</p>
        <p className="text-sm text-gray-500 mt-4">
          Created: {new Date(experiment.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Variant A */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Variant A (Control)</h2>
          <p className="text-gray-700 font-semibold mb-6">{experiment.variant_a}</p>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Sample Size</p>
              <p className="text-3xl font-bold text-gray-900">2,543</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Conversions</p>
              <p className="text-3xl font-bold text-blue-600">512</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-3xl font-bold text-gray-900">20.1%</p>
            </div>
          </div>
        </div>

        {/* Variant B */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Variant B (Treatment)</h2>
          <p className="text-gray-700 font-semibold mb-6">{experiment.variant_b}</p>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Sample Size</p>
              <p className="text-3xl font-bold text-gray-900">2,457</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Conversions</p>
              <p className="text-3xl font-bold text-green-600">589</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-3xl font-bold text-gray-900">23.9%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistical Results */}
      <div className="bg-white p-8 rounded-lg shadow border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Statistical Analysis</h2>
        
        <div className="grid grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 font-semibold">Lift</p>
            <p className="text-3xl font-bold text-blue-600">+19.0%</p>
            <p className="text-xs text-gray-500 mt-1">Variant B outperforms A</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 font-semibold">Confidence Level</p>
            <p className="text-3xl font-bold text-blue-600">94.2%</p>
            <p className="text-xs text-gray-500 mt-1">Statistical significance</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 font-semibold">Status</p>
            <p className="text-3xl font-bold text-green-600">✓</p>
            <p className="text-xs text-gray-500 mt-1">Variant B is winner</p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && experiment && (
        <EditExperimentModal
          experiment={experiment}
          onClose={() => setShowEditModal(false)}
          onUpdate={fetchExperiment}
        />
      )}
    </div>
  );
}