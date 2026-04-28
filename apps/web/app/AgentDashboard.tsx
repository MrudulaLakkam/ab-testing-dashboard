'use client';

import { useState, useEffect } from 'react';
import { masterAgent } from './agentEngine';

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

export function AgentDashboard(props: Props) {
  const [decision, setDecision] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'advisor' | 'automation' | 'insights' | 'optimization'>('advisor');

  useEffect(() => {
    const result = masterAgent({
      id: '',
      name: '',
      variantA: props.variantA,
      variantB: props.variantB,
      sampleA: props.sampleA,
      convA: props.convA,
      sampleB: props.sampleB,
      convB: props.convB,
      pValue: props.pValue,
      lift: props.lift,
      daysRunning: props.daysRunning,
    });

    setDecision(result);
    setLoading(false);
  }, [props]);

  if (loading) {
    return <div className="text-center py-8">🤖 AI Agent analyzing experiment...</div>;
  }

  if (!decision) {
    return <div className="text-center py-8">No analysis available</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Agent Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 md:p-6 rounded-lg shadow-lg">
        <h2 className="text-xl md:text-2xl font-bold mb-2">🤖 Experiment Intelligence Agent</h2>
        <p className="text-sm md:text-base text-purple-100">Multi-agent AI system analyzing your experiment in real-time</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white p-3 md:p-4 rounded-lg shadow border border-gray-200 overflow-x-auto">
        <div className="flex gap-2 whitespace-nowrap">
          {[
            { id: 'advisor', label: '💡 Advisor' },
            { id: 'automation', label: '⚙️ Automation' },
            { id: 'insights', label: '🔍 Insights' },
            { id: 'optimization', label: '🚀 Optimization' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 md:px-4 py-2 rounded-lg font-semibold text-xs md:text-sm transition ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ADVISOR AGENT */}
      {activeTab === 'advisor' && (
        <div className="space-y-4">
          <div className={`p-4 md:p-6 rounded-lg shadow border-2 ${
            decision.advisor.recommendation.action === 'launch'
              ? 'bg-green-50 border-green-500'
              : decision.advisor.recommendation.action === 'continue'
              ? 'bg-blue-50 border-blue-500'
              : decision.advisor.recommendation.action === 'optimize'
              ? 'bg-yellow-50 border-yellow-500'
              : 'bg-orange-50 border-orange-500'
          }`}>
            <h3 className="text-lg md:text-xl font-bold mb-2">
              {decision.advisor.recommendation.action === 'launch' && '✓ LAUNCH VARIANT B'}
              {decision.advisor.recommendation.action === 'continue' && '⏳ CONTINUE TEST'}
              {decision.advisor.recommendation.action === 'optimize' && '🔧 OPTIMIZE'}
              {decision.advisor.recommendation.action === 'investigate' && '🔎 INVESTIGATE'}
            </h3>
            <p className="text-sm md:text-base mb-3">{decision.advisor.recommendation.reason}</p>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    decision.advisor.recommendation.action === 'launch'
                      ? 'bg-green-600'
                      : decision.advisor.recommendation.action === 'continue'
                      ? 'bg-blue-600'
                      : 'bg-yellow-600'
                  }`}
                  style={{ width: `${decision.advisor.recommendation.confidence * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold">
                {(decision.advisor.recommendation.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-xs md:text-sm font-semibold text-gray-900">Next Steps:</p>
              {decision.advisor.recommendation.nextSteps.map((step: string, idx: number) => (
                <p key={idx} className="text-xs md:text-sm text-gray-700 ml-2">
                  {idx + 1}. {step}
                </p>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-bold mb-4">Agent Insights</h3>
            <div className="space-y-3">
              {decision.advisor.insights.map((insight: any, idx: number) => (
                <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm md:text-base text-gray-900">{insight.title}</h4>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      insight.type === 'analysis' ? 'bg-blue-100 text-blue-800' :
                      insight.type === 'recommendation' ? 'bg-green-100 text-green-800' :
                      insight.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {insight.type}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-700 mb-2">{insight.description}</p>
                  <div className="flex gap-2">
                    <div className="text-xs text-gray-600">Confidence:</div>
                    <div className="flex-1 bg-gray-300 rounded h-1">
                      <div
                        className="bg-blue-600 h-full rounded transition-all"
                        style={{ width: `${insight.confidence * 100}%` }}
                      />
                    </div>
                    <div className="text-xs font-semibold text-gray-700">
                      {(insight.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reasoning */}
          <div className="bg-gray-50 p-4 md:p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-bold mb-3">Agent Reasoning</h3>
            <p className="text-xs md:text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {decision.advisor.reasoning}
            </p>
          </div>
        </div>
      )}

      {/* AUTOMATION AGENT */}
      {activeTab === 'automation' && (
        <div className="space-y-4">
          <div className={`p-4 md:p-6 rounded-lg shadow border-2 ${
            decision.automation.shouldAutoLaunch
              ? 'bg-green-50 border-green-500'
              : 'bg-gray-50 border-gray-300'
          }`}>
            <h3 className="text-xl font-bold mb-3">
              {decision.automation.shouldAutoLaunch ? '🚀 Auto-Launch Enabled' : '⏸️ Auto-Launch Disabled'}
            </h3>
            <p className="text-base mb-4">{decision.automation.autoLaunchReason}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded border border-gray-200">
                <p className="text-sm text-gray-600">Estimated Impact</p>
                <p className="text-2xl font-bold text-green-600">
                  +{decision.automation.estimatedImpact.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-white rounded border border-gray-200">
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-2xl font-bold">
                  {decision.automation.shouldAutoLaunch ? '✓ Ready' : '⏳ Pending'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INSIGHT MINING AGENT */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 md:p-6 rounded-lg shadow border border-blue-200">
            <h3 className="text-lg font-bold mb-3">📊 Patterns Discovered</h3>
            {decision.insights.patterns.length > 0 ? (
              <ul className="space-y-2">
                {decision.insights.patterns.map((pattern: string, idx: number) => (
                  <li key={idx} className="text-sm md:text-base text-blue-900 flex gap-2">
                    <span>•</span>
                    <span>{pattern}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-blue-800">No significant patterns detected yet</p>
            )}
          </div>

          <div className="bg-green-50 p-4 md:p-6 rounded-lg shadow border border-green-200">
            <h3 className="text-lg font-bold mb-3">🎯 Opportunities Identified</h3>
            {decision.insights.opportunities.length > 0 ? (
              <ul className="space-y-2">
                {decision.insights.opportunities.map((opp: string, idx: number) => (
                  <li key={idx} className="text-sm md:text-base text-green-900 flex gap-2">
                    <span>→</span>
                    <span>{opp}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-green-800">No immediate opportunities</p>
            )}
          </div>

          <div className="bg-red-50 p-4 md:p-6 rounded-lg shadow border border-red-200">
            <h3 className="text-lg font-bold mb-3">⚠️ Risks Detected</h3>
            {decision.insights.risks.length > 0 ? (
              <ul className="space-y-2">
                {decision.insights.risks.map((risk: string, idx: number) => (
                  <li key={idx} className="text-sm md:text-base text-red-900 flex gap-2">
                    <span>!</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-red-800">No significant risks detected</p>
            )}
          </div>
        </div>
      )}

      {/* OPTIMIZATION AGENT */}
      {activeTab === 'optimization' && (
        <div className="space-y-4">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-bold mb-4">💡 Optimization Suggestions</h3>
            <div className="space-y-3">
              {decision.optimization.suggestions.map((sugg: string, idx: number) => (
                <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm md:text-base text-gray-800">
                    {idx + 1}. {sugg}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-50 p-4 md:p-6 rounded-lg shadow border border-purple-200">
            <h3 className="text-lg font-bold mb-3">📈 Predicted Lift in Production</h3>
            <div className="text-4xl font-bold text-purple-600 mb-2">
              +{decision.optimization.predictedLift.toFixed(1)}%
            </div>
            <p className="text-sm text-purple-800">
              Expected improvement when rolled out to production environment
            </p>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-bold mb-4">🚀 Recommended Next Experiments</h3>
            <div className="space-y-3">
              {decision.optimization.nextExperimentIdeas.map((idea: string, idx: number) => (
                <div key={idx} className="p-3 bg-orange-50 rounded border border-orange-200">
                  <p className="text-sm md:text-base text-orange-900">
                    {idx + 1}. {idea}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
