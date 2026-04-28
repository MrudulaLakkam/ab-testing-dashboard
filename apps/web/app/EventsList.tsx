'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

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

  if (loading) {
    return (
      <div className="bg-white p-4 md:p-8 rounded-lg shadow border border-gray-200">
        <p className="text-center py-8 text-sm md:text-base text-gray-600">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">📊 Real-Time Events</h2>
        <p className="text-xs md:text-sm text-gray-600">Tracked events auto-refresh every 5 seconds</p>
      </div>

      {/* Filter Buttons - Mobile Optimized */}
      <div className="bg-white p-3 md:p-4 rounded-lg shadow border border-gray-200 overflow-x-auto">
        <div className="flex gap-2 whitespace-nowrap">
          {eventTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setFilter(type.id)}
              className={`px-3 md:px-4 py-2 rounded-full font-semibold text-xs md:text-sm transition flex-shrink-0 ${
                filter === type.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table - Desktop */}
      <div className="hidden md:block bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">User ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Variant</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Event Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-600">
                    No events found
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{event.user_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        {event.variant}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          event.event_type === 'conversion'
                            ? 'bg-green-100 text-green-800'
                            : event.event_type === 'view'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
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
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200 text-center">
            <p className="text-sm text-gray-600">No events found</p>
          </div>
        ) : (
          filteredEvents.map((event, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-lg shadow border border-gray-200 space-y-3"
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
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                    {event.variant}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-1">Event Type</p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      event.event_type === 'conversion'
                        ? 'bg-green-100 text-green-800'
                        : event.event_type === 'view'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
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

      {/* Stats Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 md:p-6 rounded-lg border border-blue-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Total Events</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{events.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Views</p>
            <p className="text-xl md:text-2xl font-bold text-blue-600">
              {events.filter(e => e.event_type === 'view').length}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Conversions</p>
            <p className="text-xl md:text-2xl font-bold text-green-600">
              {events.filter(e => e.event_type === 'conversion').length}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Conv. Rate</p>
            <p className="text-xl md:text-2xl font-bold text-purple-600">
              {events.length > 0
                ? (
                  (events.filter(e => e.event_type === 'conversion').length / events.length) * 100
                ).toFixed(1)
                : 0}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
