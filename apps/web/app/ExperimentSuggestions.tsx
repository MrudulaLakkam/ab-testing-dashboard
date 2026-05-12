'use client';

import { useState, useEffect } from 'react';
import { generateExperimentRoadmap } from './experimentSuggestionAgent';
import { Zap, Lightbulb, ArrowUpRight } from 'lucide-react';

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
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
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
    return (
      <section className="text-center py-12">
        <p className="text-gray-600">🤖 Agent analyzing experiments...</p>
      </section>
    );
  }

  if (!roadmap) {
    return null;
  }

  const displayedSuggestions = showAll ? roadmap.suggestions : roadmap.suggestions.slice(0, 3);

  return (
    <section>
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-gray-600 font-semibold mb-1 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> AI Recommendations
          </p>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Tests we'd run next</h3>
        </div>
        {!showAll && roadmap.suggestions.length > 3 && (
          <button
            onClick={() => setShowAll(true)}
            className="text-sm font-medium text-blue-600 hover:underline hidden md:inline-flex items-center gap-1"
          >
            View all <ArrowUpRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {displayedSuggestions.map((s: any, i: number) => (
          <article
            key={s.title}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-200 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <span
                className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
                  s.difficulty === 'easy'
                    ? 'bg-green-100 text-green-800'
                    : s.difficulty === 'medium'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {s.difficulty === 'easy' ? 'High Impact' : s.difficulty === 'medium' ? 'Medium Impact' : 'Low Impact'}
              </span>
            </div>

            <h4 className="font-semibold text-gray-900 text-lg leading-snug">{s.title}</h4>
            <p className="text-sm text-gray-600 mt-2 flex-1">{s.description}</p>

            {/* AI Confidence Bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                <span>AI confidence</span>
                <span className="font-semibold text-gray-900">92%</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all"
                  style={{ width: '92%' }}
                />
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Mobile View All Button */}
      {!showAll && roadmap.suggestions.length > 3 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full mt-6 md:hidden px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg font-semibold text-sm transition-all"
        >
          View all {roadmap.suggestions.length} recommendations
        </button>
      )}

      {/* Close All Button (when expanded) */}
      {showAll && roadmap.suggestions.length > 3 && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full mt-6 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold text-sm transition-all"
        >
          Show less
        </button>
      )}
    </section>
  );
}
