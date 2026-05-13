'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { BarChart3, TrendingUp, Activity, CheckCircle2 } from 'lucide-react';

interface Event {
  id: string;
  user_id: string;
  variant: string;
  event_type: string;
  created_at: string;
}

interface Props {
  experimentId?: string;
}

export function EventsList({ experimentId }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, [experimentId]);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter((e) => e.event_type === filter));
    }
  }, [filter, events]);

  const fetchEvents = async () => {
    try {
      let query = supabase.from('events').select('*').order('created_at', { ascending: false });

      if (experimentId) {
        query = query.eq('experiment_id', experimentId);
      }

      const { data } = await query.limit(50);
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const eventTypes = [
    { id: 'all', label: `All (${events.length})` },
    { id: 'view', label: `View (${events.filter(e => e.event_type === 'view').length})` },
    { id: 'conversion', label: `Conversion (${events.filter(e => e.event_type === 'conversion').length})` },
    { id: 'custom', label: `Custom (${events.filter(e => e.event_type === 'custom').length})` },
  ];

  const conversionRate = events.length > 0
    ? ((events.filter(e => e.event_type === 'conversion').length / events.length) * 100).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2">Real-Time Events</h1>
          <p className="text-gray-600 text-sm md:text-base">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2">Real-Time Events</h1>
        <p className="text-gray-600 text-sm md:text-base">Tracked events auto-refresh every 5 seconds</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <article className="bg-white p-5 md:p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-200">
          <div className="flex items-start justify-between">
            <span className="text-xs md:text-sm text-gray-600 font-medium">Total Events</span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="mt-4 text-3xl md:text-4xl font-bold text-gray-900 leading-none tracking-tight">
            {events.length}
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-green-600">
            <TrendingUp className="w-3.5 h-3.5" />
            Real-time tracking
          </div>
        </article>

        <article className="bg-white p-5 md:p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-200">
          <div className="flex items-start justify-between">
            <span className="text-xs md:text-sm text-gray-600 font-medium">Views</span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="mt-4 text-3xl md:text-4xl font-bold text-gray-900 leading-none tracking-tight">
            {events.filter(e => e.event_type === 'view').length}
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600">
            <TrendingUp className="w-3.5 h-3.5" />
            Page views tracked
          </div>
        </article>

        <article className="bg-white p-5 md:p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-200">
          <div className="flex items-start justify-between">
            <span className="text-xs md:text-sm text-gray-600 font-medium">Conversions</span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="mt-4 text-3xl md:text-4xl font-bold text-green-600 leading-none tracking-tight">
            {events.filter(e => e.event_type === 'conversion').length}
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-green-600">
            <TrendingUp className="w-3.5 h-3.5" />
            Completed actions
          </div>
        </article>

        <article className="bg-white p-5 md:p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-200">
          <div className="flex items-start justify-between">
            <span className="text-xs md:text-sm text-gray-600 font-medium">Conv. Rate</span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="mt-4 text-3xl md:text-4xl font-bold text-purple-600 leading-none tracking-tight">
            {conversionRate}%
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-purple-600">
            <TrendingUp className="w-3.5 h-3.5" />
            Conversion rate
          </div>
        </article>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center gap-2 flex-wrap">
          {eventTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setFilter(type.id)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                filter === type.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table - Desktop */}
      <div className="hidden md:block bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">User ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Variant</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Event Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-600">
                    No events found
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{event.user_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {event.variant}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          event.event_type === 'conversion'
                            ? 'bg-green-100 text-green-700'
                            : event.event_type === 'view'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(event.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Events Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 text-center">
            <p className="text-sm text-gray-600">No events found</p>
          </div>
        ) : (
          filteredEvents.map((event, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-2xl shadow-lg border border-gray-200 space-y-3"
            >
              {/* Top Row - User ID & Time */}
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 mb-1">User ID</p>
                  <p className="text-sm font-semibold text-gray-900 break-all">{event.user_id}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-600 mb-1">Time</p>
                  <p className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                    {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Bottom Row - Variant & Event Type */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-1">Variant</p>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {event.variant}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-1">Event Type</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      event.event_type === 'conversion'
                        ? 'bg-green-100 text-green-700'
                        : event.event_type === 'view'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
