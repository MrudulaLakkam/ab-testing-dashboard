'use client';

export function ResultsChart() {
  // Simple bar chart visualization
  const data = [
    { day: 'Mon', variantA: 65, variantB: 78 },
    { day: 'Tue', variantA: 70, variantB: 82 },
    { day: 'Wed', variantA: 68, variantB: 85 },
    { day: 'Thu', variantA: 72, variantB: 88 },
    { day: 'Fri', variantA: 75, variantB: 92 },
    { day: 'Sat', variantA: 78, variantB: 95 },
    { day: 'Sun', variantA: 80, variantB: 98 },
  ];

  const maxValue = 100;

  return (
    <div className="bg-white p-8 rounded-lg shadow border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Conversion Rate Over Time</h2>

      {/* Chart */}
      <div className="mb-8">
        <div className="flex items-end justify-around h-64 border-l border-b border-gray-300 p-4">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              {/* Bars */}
              <div className="flex gap-1 h-56 items-end">
                {/* Variant A Bar */}
                <div
                  className="w-8 bg-blue-500 rounded-t transition-all hover:opacity-80"
                  style={{ height: `${(item.variantA / maxValue) * 200}px` }}
                  title={`Variant A: ${item.variantA}%`}
                ></div>
                
                {/* Variant B Bar */}
                <div
                  className="w-8 bg-green-500 rounded-t transition-all hover:opacity-80"
                  style={{ height: `${(item.variantB / maxValue) * 200}px` }}
                  title={`Variant B: ${item.variantB}%`}
                ></div>
              </div>

              {/* Day Label */}
              <p className="text-sm font-semibold text-gray-700">{item.day}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <p className="font-semibold text-gray-700">Variant A (Control) - 20.1%</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <p className="font-semibold text-gray-700">Variant B (Treatment) - 23.9%</p>
        </div>
      </div>
    </div>
  );
}