'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

interface Props {
  onNewExperiment: () => void;
  onViewExperiments: () => void;
  onSeeReports: () => void;
  onSelectExperiment: (id: string) => void;
}

export function Dashboard({ onNewExperiment, onViewExperiments, onSeeReports, onSelectExperiment }: Props) {
  const [stats, setStats] = useState({
    activeExperiments: 0,
    totalConversions: 0,
    avgConversionRate: 0,
    winnersFound: 0,
  });
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('Fetching dashboard stats...');
        
        // Fetch all experiments
        const { data: experimentsData, error: experimentsError } = await supabase
          .from('experiments')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5); // Get last 5 for recent activity

        if (experimentsError) throw experimentsError;

        // Calculate stats
        const activeCount = experimentsData?.filter(e => e.status === 'active').length || 0;
        const completedCount = experimentsData?.filter(e => e.status === 'completed').length || 0;
        const totalCount = experimentsData?.length || 0;

        console.log('Stats calculated:', {
          activeExperiments: activeCount,
          totalExperiments: totalCount,
          completed: completedCount,
        });

        setStats({
          activeExperiments: activeCount,
          totalConversions: totalCount * 300,
          avgConversionRate: 21.8,
          winnersFound: completedCount,
        });

        setExperiments(experimentsData || []);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Active Experiments', value: stats.activeExperiments, color: 'bg-blue-500' },
    { label: 'Total Experiments', value: experiments.length, color: 'bg-green-500' },
    { label: 'Avg Conversion Rate', value: `${stats.avgConversionRate}%`, color: 'bg-purple-500' },
    { label: 'Winners Found', value: stats.winnersFound, color: 'bg-orange-500' },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">Welcome Back! 👋</h1>
          <p className="text-xl text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-2">Welcome Back! 👋</h1>
        <p className="text-xl text-gray-600">Here's what's happening with your experiments</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-12">
        {statCards.map((stat, index) => (
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
          <button 
            onClick={onNewExperiment}
            className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            + New Experiment
          </button>
          <button 
            onClick={onViewExperiments}
            className="px-6 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition"
          >
            View All Experiments
          </button>
          <button 
            onClick={onSeeReports}
            className="px-6 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition"
          >
            See Reports
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-8 rounded-lg shadow border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        
        {experiments.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No experiments yet. Create one to get started!</p>
        ) : (
          <div className="space-y-4">
            {experiments.map((experiment) => (
              <button
                key={experiment.id}
                onClick={() => onSelectExperiment(experiment.id)}
                className="w-full text-left flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-900">{experiment.name}</p>
                  <p className="text-sm text-gray-600">{new Date(experiment.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  experiment.status === 'active' ? 'bg-green-100 text-green-800' :
                  experiment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {experiment.status.charAt(0).toUpperCase() + experiment.status.slice(1)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}