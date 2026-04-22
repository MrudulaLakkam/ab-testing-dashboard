'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

interface Experiment {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

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
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: experimentsData, error: experimentsError } = await supabase
          .from('experiments')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (experimentsError) throw experimentsError;

        const activeCount = experimentsData?.filter(e => e.status === 'active').length || 0;
        const completedCount = experimentsData?.filter(e => e.status === 'completed').length || 0;
        const totalCount = experimentsData?.length || 0;

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
    { label: 'Active', value: stats.activeExperiments, color: 'bg-blue-500' },
    { label: 'Total', value: experiments.length, color: 'bg-green-500' },
    { label: 'Avg Rate', value: `${stats.avgConversionRate}%`, color: 'bg-purple-500' },
    { label: 'Winners', value: stats.winnersFound, color: 'bg-orange-500' },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2">Welcome Back! 👋</h1>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2">Welcome Back! 👋</h1>
        <p className="text-gray-600 text-sm md:text-base">Here's what's happening with your experiments</p>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-4 md:p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <p className="text-xs md:text-sm text-gray-600 font-semibold mb-2 truncate">{stat.label}</p>
            <div className="flex items-center gap-2 md:gap-3">
              <div className={`${stat.color} w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0`}></div>
              <p className="text-2xl md:text-4xl font-bold text-gray-900 truncate">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions - Stack on Mobile */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 md:p-8 rounded-lg shadow space-y-4">
        <h2 className="text-xl md:text-2xl font-bold">Quick Actions</h2>
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <button 
            onClick={onNewExperiment}
            className="px-4 md:px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition text-sm md:text-base"
          >
            + New
          </button>
          <button 
            onClick={onViewExperiments}
            className="px-4 md:px-6 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition text-sm md:text-base"
          >
            View All
          </button>
          <button 
            onClick={onSeeReports}
            className="px-4 md:px-6 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition text-sm md:text-base"
          >
            Reports
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 md:p-8 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Recent Activity</h2>
        
        {experiments.length === 0 ? (
          <p className="text-gray-600 text-center py-8 text-sm md:text-base">No experiments yet. Create one to get started!</p>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {experiments.map((experiment) => (
              <button
                key={experiment.id}
                onClick={() => onSelectExperiment(experiment.id)}
                className="w-full text-left flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors gap-2"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate text-sm md:text-base">{experiment.name}</p>
                  <p className="text-xs md:text-sm text-gray-600">{new Date(experiment.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-semibold flex-shrink-0 ${
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
