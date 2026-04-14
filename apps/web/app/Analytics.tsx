'use client';

import { ResultsChart } from './ResultsChart';

export function Analytics() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics</h1>
      <p className="text-gray-600 mb-8">Deep dive into your experiment data</p>

      {/* Chart */}
      <div className="mb-12">
        <ResultsChart />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-600 font-semibold mb-2">Total Visitors</p>
          <p className="text-4xl font-bold text-gray-900">5,000</p>
          <p className="text-xs text-gray-500 mt-2">Across all experiments</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-600 font-semibold mb-2">Statistical Power</p>
          <p className="text-4xl font-bold text-blue-600">87%</p>
          <p className="text-xs text-gray-500 mt-2">Confidence in results</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-600 font-semibold mb-2">Avg Effect Size</p>
          <p className="text-4xl font-bold text-green-600">+8.5%</p>
          <p className="text-xs text-gray-500 mt-2">Lift per variant</p>
        </div>
      </div>
    </div>
  );
}