'use client';

interface ExperimentData {
  id: string;
  name: string;
  hypothesis: string;
  variantA: string;
  variantB: string;
  status: string;
}

export function ExperimentDetail({ experimentId, onBack }: {
  experimentId: string;
  onBack: () => void;
}) {
  // Mock data - we'll replace with real data later
  const experiment: ExperimentData = {
    id: experimentId,
    name: 'Button Color Test',
    hypothesis: 'Red button increases click-through rate by 10%',
    variantA: 'Blue Button',
    variantB: 'Red Button',
    status: 'active',
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold"
      >
        ← Back to Experiments
      </button>

      {/* Header */}
      <div className="bg-white p-8 rounded-lg shadow border border-gray-200 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-gray-900">{experiment.name}</h1>
          <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
            Active
          </span>
        </div>
        <p className="text-gray-700 text-lg">{experiment.hypothesis}</p>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Variant A */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Variant A (Control)</h2>
          <p className="text-gray-700 font-semibold mb-6">{experiment.variantA}</p>

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
          <p className="text-gray-700 font-semibold mb-6">{experiment.variantB}</p>

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
    </div>
  );
}