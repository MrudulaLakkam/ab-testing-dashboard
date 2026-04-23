'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ExperimentStats {
  name: string;
  totalEvents: number;
  conversions: number;
  conversionRate: number;
  status: string;
}

interface TrendData {
  date: string;
  conversions: number;
  views: number;
}

interface EventTypeData {
  name: string;
  value: number;
}

export function Analytics() {
  const [experiments, setExperiments] = useState<ExperimentStats[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [eventTypes, setEventTypes] = useState<EventTypeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: experimentsData } = await supabase
        .from('experiments')
        .select('*')
        .order('created_at', { ascending: false });

      if (experimentsData) {
        const statsPromises = experimentsData.map(async (exp) => {
          const { data: events } = await supabase
            .from('events')
            .select('*')
            .eq('experiment_id', exp.id);

          const totalEvents = events?.length || 0;
          const conversions = events?.filter(e => e.event_type === 'conversion').length || 0;
          const conversionRate = totalEvents > 0 ? (conversions / totalEvents) * 100 : 0;

          return {
            name: exp.name,
            totalEvents,
            conversions,
            conversionRate: Math.round(conversionRate * 10) / 10,
            status: exp.status,
          };
        });

        const stats = await Promise.all(statsPromises);
        setExperiments(stats);
      }

      const { data: allEvents } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: true });

      if (allEvents) {
        const trendMap = new Map<string, { conversions: number; views: number }>();
        
        allEvents.forEach((event) => {
          const date = new Date(event.created_at).toLocaleDateString();
          const current = trendMap.get(date) || { conversions: 0, views: 0 };
          
          if (event.event_type === 'conversion') {
            current.conversions++;
          } else {
            current.views++;
          }
          
          trendMap.set(date, current);
        });

        const trendData = Array.from(trendMap.entries()).map(([date, data]) => ({
          date,
          ...data,
        }));

        setTrends(trendData);

        const eventCounts = {
          view: allEvents.filter(e => e.event_type === 'view').length,
          conversion: allEvents.filter(e => e.event_type === 'conversion').length,
          custom: allEvents.filter(e => e.event_type === 'custom').length,
        };

        setEventTypes([
          { name: 'Views', value: eventCounts.view },
          { name: 'Conversions', value: eventCounts.conversion },
          { name: 'Custom', value: eventCounts.custom },
        ]);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-4 md:space-y-8 px-4 md:px-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-sm md:text-base text-gray-600">Comprehensive A/B testing insights</p>
      </div>

      {/* Experiment Performance */}
      <div className="bg-white p-4 md:p-8 rounded-lg shadow border border-gray-200">
        <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Experiment Performance</h2>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Experiment</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Events</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Conversions</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Conv. Rate</th>
              </tr>
            </thead>
            <tbody>
              {experiments.map((exp, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900 font-semibold text-sm">{exp.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      exp.status === 'active' ? 'bg-green-100 text-green-800' :
                      exp.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {exp.status.charAt(0).toUpperCase() + exp.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 text-sm">{exp.totalEvents.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-700 text-sm">{exp.conversions}</td>
                  <td className="py-3 px-4 font-semibold text-blue-600 text-sm">{exp.conversionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {experiments.map((exp, i) => (
            <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 text-sm flex-1 break-words pr-2">{exp.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                  exp.status === 'active' ? 'bg-green-100 text-green-800' :
                  exp.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {exp.status.charAt(0).toUpperCase() + exp.status.slice(1)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-600">Total Events</p>
                  <p className="font-semibold text-gray-900">{exp.totalEvents.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Conversions</p>
                  <p className="font-semibold text-gray-900">{exp.conversions}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-300">
                <p className="text-gray-600 text-xs">Conv. Rate</p>
                <p className="font-semibold text-blue-600 text-sm">{exp.conversionRate}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Trends */}
      <div className="bg-white p-4 md:p-8 rounded-lg shadow border border-gray-200">
        <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Conversion Trends</h2>
        <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
          {trends.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval={Math.floor(trends.length / 4)}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Event Distribution & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        
        {/* Pie Chart */}
        <div className="bg-white p-4 md:p-8 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Event Distribution</h2>
          <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
            {eventTypes.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eventTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {eventTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-white p-4 md:p-8 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Summary Statistics</h2>
          <div className="space-y-3 md:space-y-4">
            <div className="flex justify-between items-center pb-3 md:pb-4 border-b border-gray-200">
              <span className="text-sm md:text-base text-gray-700">Total Experiments</span>
              <span className="text-xl md:text-2xl font-bold text-gray-900">{experiments.length}</span>
            </div>
            <div className="flex justify-between items-center pb-3 md:pb-4 border-b border-gray-200">
              <span className="text-sm md:text-base text-gray-700">Active Experiments</span>
              <span className="text-xl md:text-2xl font-bold text-green-600">
                {experiments.filter(e => e.status === 'active').length}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 md:pb-4 border-b border-gray-200">
              <span className="text-sm md:text-base text-gray-700">Completed</span>
              <span className="text-xl md:text-2xl font-bold text-blue-600">
                {experiments.filter(e => e.status === 'completed').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm md:text-base text-gray-700">Avg Conversion Rate</span>
              <span className="text-xl md:text-2xl font-bold text-purple-600">
                {experiments.length > 0 
                  ? (experiments.reduce((sum, e) => sum + e.conversionRate, 0) / experiments.length).toFixed(1)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
