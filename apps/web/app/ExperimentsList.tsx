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
      <div className="max-w-6xl mx-auto px-4 md:px-0">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-8">All Experiments</h2>
        <div className="text-center py-8 md:py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-base md:text-lg">Loading experiments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-0">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-8">All Experiments</h2>
        <div className="text-center py-8 md:py-12 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600 text-base md:text-lg">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-0">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">All Experiments</h2>
        <p className="text-gray-600 text-sm md:text-base">Track and manage your A/B tests ({experiments.length} total)</p>
      </div>

      {/* Empty State */}
      {experiments.length === 0 ? (
        <div className="text-center py-8 md:py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-base md:text-lg">No experiments yet. Create one to get started!</p>
        </div>
      ) : (
        /* Experiments List */
        <div className="space-y-3 md:space-y-4">
          {experiments.map((experiment) => (
            <div
              key={experiment.id}
              className="bg-white p-4 md:p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onSelectExperiment(experiment.id)}
            >
              {/* Mobile Layout - Stack Vertically */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                
                {/* Left Content */}
                <div className="flex-1 min-w-0">
                  
                  {/* Title and Status */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-3">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 break-words">
                      {experiment.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-semibold border w-fit ${getStatusColor(experiment.status)}`}>
                      {experiment.status.charAt(0).toUpperCase() + experiment.status.slice(1)}
                    </span>
                  </div>
                  
                  {/* Hypothesis */}
                  <p className="text-gray-700 text-sm md:text-base mb-3 line-clamp-2">
                    {experiment.hypothesis}
                  </p>

                  {/* Variants - Stack on Mobile, Flex on Desktop */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 text-xs md:text-sm text-gray-600 mb-3">
                    <div className="break-words">
                      <span className="font-semibold">Variant A:</span> {experiment.variant_a}
                    </div>
                    <div className="break-words">
                      <span className="font-semibold">Variant B:</span> {experiment.variant_b}
                    </div>
                  </div>

                  {/* Created Date */}
                  <p className="text-xs text-gray-500">
                    Created: {new Date(experiment.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* View Results Button - Full Width on Mobile */}
                <button 
                  className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition text-sm md:text-base mt-3 md:mt-0 whitespace-nowrap"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectExperiment(experiment.id);
                  }}
                >
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
