'use client';

export function Dashboard() {
  // Mock stats
  const stats = [
    { label: 'Active Experiments', value: '3', color: 'bg-blue-500' },
    { label: 'Total Conversions', value: '1,101', color: 'bg-green-500' },
    { label: 'Avg Conversion Rate', value: '21.8%', color: 'bg-purple-500' },
    { label: 'Winners Found', value: '1', color: 'bg-orange-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-2">Welcome Back! 👋</h1>
        <p className="text-xl text-gray-600">Here's what's happening with your experiments</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <p className="text-sm text-gray-600 font-semibold mb-2">{stat.label}</p>
            <div className="flex items-center gap-3">
              <div className={`${stat.color} w-12 h-12 rounded-lg`}></div>
              <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8 rounded-lg shadow mb-12">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <button className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100">
            + New Experiment
          </button>
          <button className="px-6 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800">
            View All Experiments
          </button>
          <button className="px-6 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800">
            See Reports
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-8 rounded-lg shadow border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        
        <div className="space-y-4">
          {[
            { experiment: 'Button Color Test', status: 'Running', time: '2 hours ago' },
            { experiment: 'Homepage Headline', status: 'Completed', time: '1 day ago' },
            { experiment: 'Email Subject Line', status: 'Draft', time: '2 days ago' },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div>
                <p className="font-semibold text-gray-900">{activity.experiment}</p>
                <p className="text-sm text-gray-600">{activity.time}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                activity.status === 'Running' ? 'bg-green-100 text-green-800' :
                activity.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}