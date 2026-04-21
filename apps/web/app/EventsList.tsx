'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

interface Event {
  id: string;
  experiment_id: string;
  user_id: string;
  variant_id: string;
  event_type: string;
  properties: Record<string, any>;
  created_at: string;
}

export function EventsList({ experimentId }: { experimentId: string }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'view' | 'conversion' | 'custom'>('all');

  useEffect(() => {
    fetchEvents();
    // Refresh every 5 seconds
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, [experimentId, filter]);

  const fetchEvents = async () => {
    try {
      let query = supabase
        .from('events')
        .select('*')
        .eq('experiment_id', experimentId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter !== 'all') {
        query = query.eq('event_type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'view':
        return 'bg-blue-100 text-blue-800';
      case 'conversion':
        return 'bg-green-100 text-green-800';
      case 'custom':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVariantColor = (variant: string) => {
    return variant === 'variant-a' ? 'bg-blue-50' : 'bg-green-50';
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Real-Time Events</h2>
        <div className="flex gap-2">
          {(['all', 'view', 'conversion', 'custom'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
              {type === 'all' && ` (${events.length})`}
              {type === 'view' && ` (${events.filter(e => e.event_type === 'view').length})`}
              {type === 'conversion' && ` (${events.filter(e => e.event_type === 'conversion').length})`}
              {type === 'custom' && ` (${events.filter(e => e.event_type === 'custom').length})`}
            </button>
          ))}
        </div>
      </div>

      {loading && events.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No events tracked yet</p>
          <p className="text-sm text-gray-500 mt-2">Events will appear here when users interact with your experiment</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">User ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Variant</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Event Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Properties</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className={`border-b border-gray-100 hover:bg-gray-50 ${getVariantColor(event.variant_id)}`}>
                  <td className="py-3 px-4 text-sm text-gray-900 font-mono">{event.user_id.substring(0, 20)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                      {event.variant_id}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getEventColor(event.event_type)}`}>
                      {event.event_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {event.properties && Object.keys(event.properties).length > 0 ? (
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {JSON.stringify(event.properties).substring(0, 50)}...
                      </code>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {new Date(event.created_at).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600 flex justify-between">
        <span>Total events: {events.length}</span>
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
