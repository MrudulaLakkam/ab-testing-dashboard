'use client';

import { useState } from 'react';
import { supabase } from './supabaseClient';

interface Props {
  experimentId: string;
  variantA: string;
  variantB: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EventRecorderModal({ experimentId, variantA, variantB, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'mode' | 'simulate' | 'results'>('mode');
  const [selectedMode, setSelectedMode] = useState<'simulate' | 'quick'>('');
  
  // Simulate mode
  const [simulationConfig, setSimulationConfig] = useState({
    totalUsers: 1000,
    conversionRate: 0.20,
    variantSplit: 0.5,
    liftPercent: 20,
  });

  const [results, setResults] = useState<any>(null);

  // Quick mode
  const [quickMode, setQuickMode] = useState({
    variantA: { views: 0, conversions: 0 },
    variantB: { views: 0, conversions: 0 },
  });

  const [userActions, setUserActions] = useState<Array<{
    id: string;
    variant: 'a' | 'b';
    action: 'view' | 'conversion' | 'bounce';
    time: string;
  }>>([]);

  // Interactive Simulation Mode
  const handleSimulateClick = async () => {
    setLoading(true);
    try {
      const variantAUsers = Math.floor(simulationConfig.totalUsers * simulationConfig.variantSplit);
      const variantBUsers = simulationConfig.totalUsers - variantAUsers;

      const convRateA = simulationConfig.conversionRate;
      const convRateB = simulationConfig.conversionRate * (1 + simulationConfig.liftPercent / 100);

      const convA = Math.floor(variantAUsers * convRateA);
      const convB = Math.floor(variantBUsers * convRateB);

      // Generate events with realistic distribution
      const eventsA = Array.from({ length: variantAUsers }, (_, i) => ({
        experiment_id: experimentId,
        user_id: `user_a_${Math.random().toString(36).substr(2, 9)}`,
        variant: 'a',
        event_type: i < convA ? 'conversion' : 'view',
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      }));

      const eventsB = Array.from({ length: variantBUsers }, (_, i) => ({
        experiment_id: experimentId,
        user_id: `user_b_${Math.random().toString(36).substr(2, 9)}`,
        variant: 'b',
        event_type: i < convB ? 'conversion' : 'view',
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      }));

      const allEvents = [...eventsA, ...eventsB];

      const { error } = await supabase.from('events').insert(allEvents);
      if (error) throw error;

      setResults({
        totalEvents: allEvents.length,
        variantA: { users: variantAUsers, conversions: convA, rate: (convA / variantAUsers * 100).toFixed(1) },
        variantB: { users: variantBUsers, conversions: convB, rate: (convB / variantBUsers * 100).toFixed(1) },
      });
      setStep('results');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Interactive Quick Mode - Click based
  const handleUserAction = (variant: 'a' | 'b', action: 'view' | 'conversion') => {
    const newAction = {
      id: `${Date.now()}_${Math.random()}`,
      variant,
      action,
      time: new Date().toLocaleTimeString(),
    };

    setUserActions([...userActions, newAction]);

    // Update counts
    setQuickMode(prev => ({
      ...prev,
      [variant === 'a' ? 'variantA' : 'variantB']: {
        ...prev[variant === 'a' ? 'variantA' : 'variantB'],
        views: prev[variant === 'a' ? 'variantA' : 'variantB'].views + (action === 'view' ? 1 : 0),
        conversions: prev[variant === 'a' ? 'variantA' : 'variantB'].conversions + (action === 'conversion' ? 1 : 0),
      },
    }));
  };

  const handleSubmitQuickMode = async () => {
    setLoading(true);
    try {
      const events = userActions.map(action => ({
        experiment_id: experimentId,
        user_id: action.id,
        variant: action.variant,
        event_type: action.action === 'conversion' ? 'conversion' : 'view',
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('events').insert(events);
      if (error) throw error;

      setResults({
        totalEvents: events.length,
        variantA: {
          users: quickMode.variantA.views,
          conversions: quickMode.variantA.conversions,
          rate: (quickMode.variantA.conversions / Math.max(quickMode.variantA.views, 1) * 100).toFixed(1),
        },
        variantB: {
          users: quickMode.variantB.views,
          conversions: quickMode.variantB.conversions,
          rate: (quickMode.variantB.conversions / Math.max(quickMode.variantB.views, 1) * 100).toFixed(1),
        },
      });
      setStep('results');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Select Mode
  if (step === 'mode') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">📊 Record Test Events</h2>
          <p className="text-gray-600">Choose how you want to generate test data</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Simulate Mode */}
            <button
              onClick={() => {
                setSelectedMode('simulate');
                setStep('simulate');
              }}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
            >
              <div className="text-4xl mb-2">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Simulate Traffic</h3>
              <p className="text-sm text-gray-600 mb-3">
                Instantly generate realistic traffic patterns with customizable parameters
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>✓ Control total users</li>
                <li>✓ Set conversion rates</li>
                <li>✓ Adjust variant split</li>
                <li>✓ Add lift percentage</li>
              </ul>
            </button>

            {/* Quick Mode */}
            <button
              onClick={() => {
                setSelectedMode('quick');
                setStep('simulate');
              }}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-left"
            >
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Click & Track</h3>
              <p className="text-sm text-gray-600 mb-3">
                Manually click buttons to simulate real user interactions
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>✓ Interactive experience</li>
                <li>✓ Real-time tracking</li>
                <li>✓ See events as you create</li>
                <li>✓ Full control</li>
              </ul>
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Simulate or Quick Mode
  if (step === 'simulate') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 space-y-6 my-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedMode === 'simulate' ? '⚡ Simulate Traffic' : '🎯 Click & Track Events'}
          </h2>

          {/* Simulate Mode */}
          {selectedMode === 'simulate' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Total Users</label>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={simulationConfig.totalUsers}
                    onChange={(e) => setSimulationConfig({ ...simulationConfig, totalUsers: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-2xl font-bold text-blue-600 mt-2">{simulationConfig.totalUsers.toLocaleString()} users</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Base Conversion Rate</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={simulationConfig.conversionRate * 100}
                    onChange={(e) => setSimulationConfig({ ...simulationConfig, conversionRate: parseInt(e.target.value) / 100 })}
                    className="w-full"
                  />
                  <p className="text-2xl font-bold text-blue-600 mt-2">{(simulationConfig.conversionRate * 100).toFixed(0)}%</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Variant A Split</label>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="5"
                    value={simulationConfig.variantSplit * 100}
                    onChange={(e) => setSimulationConfig({ ...simulationConfig, variantSplit: parseInt(e.target.value) / 100 })}
                    className="w-full"
                  />
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {(simulationConfig.variantSplit * 100).toFixed(0)}% / {(100 - simulationConfig.variantSplit * 100).toFixed(0)}%
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Variant B Lift</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={simulationConfig.liftPercent}
                    onChange={(e) => setSimulationConfig({ ...simulationConfig, liftPercent: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-2xl font-bold text-green-600 mt-2">+{simulationConfig.liftPercent}%</p>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">📈 Preview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">{variantA}</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {Math.floor(simulationConfig.totalUsers * simulationConfig.variantSplit).toLocaleString()} users
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      ~{Math.floor(simulationConfig.totalUsers * simulationConfig.variantSplit * simulationConfig.conversionRate)} conversions
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">{variantB}</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {Math.floor(simulationConfig.totalUsers * (1 - simulationConfig.variantSplit)).toLocaleString()} users
                    </p>
                    <p className="text-xs text-green-600 mt-1 font-semibold">
                      ~{Math.floor(simulationConfig.totalUsers * (1 - simulationConfig.variantSplit) * simulationConfig.conversionRate * (1 + simulationConfig.liftPercent / 100))} conversions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Mode */}
          {selectedMode === 'quick' && (
            <div className="space-y-6">
              <p className="text-gray-600">Click the buttons below to simulate real user interactions</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Variant A */}
                <div className="border-l-4 border-blue-500 pl-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{variantA}</h3>
                    <p className="text-xs text-gray-600">Views: {quickMode.variantA.views} | Conversions: {quickMode.variantA.conversions}</p>
                  </div>
                  <button
                    onClick={() => handleUserAction('a', 'view')}
                    className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold text-sm"
                  >
                    👁️ User Views
                  </button>
                  <button
                    onClick={() => handleUserAction('a', 'conversion')}
                    className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-semibold text-sm"
                  >
                    ✅ User Converts
                  </button>
                </div>

                {/* Variant B */}
                <div className="border-l-4 border-green-500 pl-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{variantB}</h3>
                    <p className="text-xs text-gray-600">Views: {quickMode.variantB.views} | Conversions: {quickMode.variantB.conversions}</p>
                  </div>
                  <button
                    onClick={() => handleUserAction('b', 'view')}
                    className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold text-sm"
                  >
                    👁️ User Views
                  </button>
                  <button
                    onClick={() => handleUserAction('b', 'conversion')}
                    className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-semibold text-sm"
                  >
                    ✅ User Converts
                  </button>
                </div>
              </div>

              {/* Event Log */}
              {userActions.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                  <p className="text-xs font-semibold text-gray-700 mb-2">📋 Event Log ({userActions.length} events)</p>
                  <div className="space-y-1">
                    {userActions.slice(-10).reverse().map((action) => (
                      <div key={action.id} className="text-xs text-gray-600 flex justify-between">
                        <span>
                          {action.action === 'conversion' ? '✅' : '👁️'} Variant {action.variant.toUpperCase()} - {action.action}
                        </span>
                        <span className="text-gray-500">{action.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep('mode')}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Back
            </button>
            <button
              onClick={selectedMode === 'simulate' ? handleSimulateClick : handleSubmitQuickMode}
              disabled={loading || (selectedMode === 'quick' && userActions.length === 0)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Submit & Record'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Results
  if (step === 'results') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4 text-center">
          <div className="text-5xl">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900">Success!</h2>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-2">Events recorded:</p>
            <p className="text-2xl font-bold text-green-600">{results?.totalEvents.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-gray-600">{variantA}</p>
              <p className="font-semibold text-gray-900">{results?.variantA.conversions} conversions</p>
              <p className="text-gray-600">{results?.variantA.rate}%</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-gray-600">{variantB}</p>
              <p className="font-semibold text-gray-900">{results?.variantB.conversions} conversions</p>
              <p className="text-green-600 font-semibold">{results?.variantB.rate}%</p>
            </div>
          </div>

          <button
            onClick={() => {
              onSuccess();
              onClose();
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            View Results
          </button>
        </div>
      </div>
    );
  }

  return null;
}
