'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { suggestNewExperiments, generateExperimentRoadmap } from './experimentSuggestionAgent';

interface Experiment {
  name: string;
  lift: number;
  pValue: number;
  conversionRate: number;
  isSignificant: boolean;
}

export function ExperimentSuggestions() {
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      // Mock experiment data for demo
      const mockExperiments: Experiment[] = [
        {
          name: 'Button Color Test',
          lift: 18.9,
          pValue: 0.018,
          conversionRate: 23.9,
          isSignificant: true,
        },
        {
          name: 'CTA Text Test',
          lift: 12.5,
          pValue: 0.045,
          conversionRate: 22.1,
          isSignificant: true,
        },
        {
          name: 'Pricing Page Test',
          lift: 8.3,
          pValue: 0.12,
          conversionRate: 20.8,
          isSignificant: false,
        },
      ];

      const data = generateExperimentRoadmap(mockExperiments);
      setRoadmap(data);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">🤖 Agent analyzing experiments...</div>;
  }

  if (!roadmap) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-6 rounded-lg shadow border border-purple-200 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="text-3xl">🚀</span>
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-bold text-gray-900">Experiment Agent Recommendations</h3>
          <p className="text-xs md:text-sm text-gray-600">{roadmap.summary}</p>
        </div>
      </div>

      {/* Estimated Monthly Lift */}
      <div className="bg-white p-3 md:p-4 rounded-lg border border-purple-200">
        <p className="text-xs md:text-sm text-gray-600 mb-1">Potential Monthly Lift</p>
        <p className="text-2xl md:text-3xl font-bold text-purple-600">
          +{roadmap.estimatedMonthlyLift}%
        </p>
        <p className="text-xs text-gray-500 mt-1">From top 3 recommendations</p>
      </div>

      {/* Suggestions */}
      <div className="space-y-2">
        {roadmap.suggestions.map((suggestion: any, idx: number) => (
          <div
            key={idx}
            className={`border rounded-lg transition-all cursor-pointer ${
              expandedIndex === idx
                ? 'bg-white border-purple-300 shadow-md'
                : 'bg-white/50 border-purple-100 hover:bg-white'
            }`}
          >
            <button
              onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
              className="w-full p-3 md:p-4 text-left"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm md:text-base mb-1">
                    {idx + 1}. {suggestion.title}
                  </h4>
                  <p className="text-xs md:text-sm text-gray-600">{suggestion.description}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-lg md:text-xl font-bold text-green-600 mb-1">
                    +{suggestion.expectedLift}%
                  </div>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      suggestion.difficulty === 'easy'
                        ? 'bg-green-100 text-green-800'
                        : suggestion.difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {suggestion.difficulty}
                  </span>
                </div>
              </div>
            </button>

            {/* Expanded Details */}
            {expandedIndex === idx && (
              <div className="border-t border-gray-200 p-3 md:p-4 bg-gray-50 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Hypothesis</p>
                  <p className="text-xs md:text-sm text-gray-700">{suggestion.hypothesis}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Expected Lift</p>
                    <p className="text-lg font-bold text-green-600">+{suggestion.expectedLift}%</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Time to Run</p>
                    <p className="text-lg font-bold text-blue-600">{suggestion.timeToRun}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Why This Matters</p>
                  <p className="text-xs md:text-sm text-gray-700">{suggestion.reason}</p>
                </div>

                <button className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-xs md:text-sm transition">
                  Create This Experiment
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Next Steps */}
      <div className="bg-white p-3 md:p-4 rounded-lg border border-purple-200">
        <p className="text-xs font-semibold text-gray-700 mb-2">Recommended Next Steps</p>
        <ul className="space-y-1">
          {roadmap.nextSteps.map((step: string, idx: number) => (
            <li key={idx} className="text-xs md:text-sm text-gray-700 flex gap-2">
              <span className="font-semibold flex-shrink-0">{step.split('.')[0]}.</span>
              <span>{step.split('.')[1]}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
