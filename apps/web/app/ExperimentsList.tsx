'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  variant_a: string;
  variant_b: string;
  status: 'draft' | 'active' | 'completed';
  created_at: string;
}

export function ExperimentsList({ onSelectExperiment }: {
  onSelectExperiment: (id: string) => void;
}) {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch experiments from Supabase
  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        console.log('Fetching experiments from Supabase...');
        const { data, error: fetchError } = await supabase
          .from('experiments')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        console.log('Experiments loaded:', data);
        setExperiments(data || []);
      } catch (err: any) {
        console.error('Error fetching experiments:', err);
        setError(err.message || 'Failed to load experiments');
      } finally {
        setLoading(false);
      }
    };

    fetchExperiments();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-800 mb-8">All Experiments</h2>
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-lg">Loading experiments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-800 mb-8">All Experiments</h2>
        <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600 text-lg">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-800 mb-2">All Experiments</h2>
        <p className="text-gray-600">Track and manage your A/B tests ({experiments.length} total)</p>
      </div>

      {experiments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-lg">No experiments yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {experiments.map((experiment) => (
            <div
              key={experiment.id}
              className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onSelectExperiment(experiment.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {experiment.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(experiment.status)}`}>
                      {experiment.status.charAt(0).toUpperCase() + experiment.status.slice(1)}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3">
                    {experiment.hypothesis}
                  </p>

                  <div className="flex gap-6 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-semibold">Variant A:</span> {experiment.variant_a}
                    </div>
                    <div>
                      <span className="font-semibold">Variant B:</span> {experiment.variant_b}
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    Created: {new Date(experiment.created_at).toLocaleDateString()}
                  </p>
                </div>

                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold ml-4">
                  View Results →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}