'use client';

import { useState, useEffect } from 'react';
import { analyzeExperimentWithClaude, getDeepInsightsWithClaude } from './claudeAgentEngine';

interface Props {
  experimentId: string;
  variantA: string;
  variantB: string;
  sampleA: number;
  convA: number;
  sampleB: number;
  convB: number;
  pValue: number;
  lift: number;
  daysRunning: number;
}

export function RealAgentDashboard(props: Props) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'insights'>('analysis');

  useEffect(() => {
    loadClaudeAnalysis();
  }, [props]);

  const loadClaudeAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const [analysisResult, insightsResult] = await Promise.all([
        analyzeExperimentWithClaude(props),
        getDeepInsightsWithClaude(props),
      ]);

      if (analysisResult.success) {
        setAnalysis(analysisResult.analysis);
      } else {
        setError(analysisResult.error);
      }

      if (insightsResult.success) {
        setInsights(insightsResult.insights);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow border border-gray-200 text-center">
        <p className="text-lg text-gray-600 mb-2">🤖 Claude AI Agent analyzing...</p>
        <p className="text-sm text-gray-500">This may take a moment</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-8 rounded-lg shadow border border-red-200 text-center">
        <p className="text-red-600 font-semibold mb-2">⚠️ Error loading analysis</p>
        <p className="text-sm text-red-500">{error}</p>
        <button
          onClick={loadClaudeAnalysis}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-2">🤖 Claude AI Agent Analysis</h2>
        <p className="text-blue-100">Powered by Claude Opus - Real AI reasoning</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 overflow-x-auto">
        <div className="flex gap-2 whitespace-nowrap">
          {[
            { id: 'analysis', label: '📊 Analysis' },
            { id: 'insights', label: '🔬 Deep Insights' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
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

      {/* Analysis Tab */}
      {activeTab === 'analysis' && analysis && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="text-gray-700 whitespace-pre-wrap font-mono text-sm leading-relaxed">
            {analysis}
          </div>
        </div>
      )}

      {/* Deep Insights Tab */}
      {activeTab === 'insights' && insights && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="text-gray-700 whitespace-pre-wrap font-mono text-sm leading-relaxed">
            {insights}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={loadClaudeAnalysis}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
      >
        🔄 Refresh Analysis
      </button>
    </div>
  );
}
