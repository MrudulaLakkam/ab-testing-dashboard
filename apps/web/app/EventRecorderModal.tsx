'use client';

import { useState } from 'react';
import { supabase } from './supabaseClient';

interface Props {
  experimentId: string;
  variantA: string;
  variantB: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EventRecorderModal({ experimentId, variantA, variantB, onClose, onSuccess }: Props) {
  const [events, setEvents] = useState<Array<{ variant: 'a' | 'b'; type: 'view' | 'conversion' }>>([]);
  const [saving, setSaving] = useState(false);

  const handleAddEvent = (variant: 'a' | 'b', eventType: 'view' | 'conversion') => {
    setEvents([...events, { variant, type: eventType }]);
  };

  const handleSaveEvents = async () => {
    if (events.length === 0) {
      alert('Add at least one event');
      return;
    }

    setSaving(true);
    try {
      const eventsToInsert = events.map(event => ({
        experiment_id: experimentId,
        user_id: `user_${Date.now()}_${Math.random()}`,
        variant: event.variant,
        event_type: event.type,
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('events').insert(eventsToInsert);

      if (error) throw error;

      alert(`✅ Saved ${events.length} event(s)!`);
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const variantACount = events.filter(e => e.variant === 'a').length;
  const variantBCount = events.filter(e => e.variant === 'b').length;
  const variantAConversions = events.filter(e => e.variant === 'a' && e.type === 'conversion').length;
  const variantBConversions = events.filter(e => e.variant === 'b' && e.type === 'conversion').length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 space-y-6 my-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">📊 Record Events</h2>
          <p className="text-gray-600 mt-1">Click a button each time an event happens</p>
        </div>

        {/* Event Counter */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border-2 border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-3">Events Recorded: {events.length}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-600">{variantA}</p>
              <p className="text-2xl font-bold text-blue-600">{variantACount}</p>
              <p className="text-xs text-gray-500">{variantAConversions} conversions</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">{variantB}</p>
              <p className="text-2xl font-bold text-green-600">{variantBCount}</p>
              <p className="text-xs text-gray-500">{variantBConversions} conversions</p>
            </div>
          </div>
        </div>

        {/* Button Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Variant A */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900 text-center">{variantA}</p>
            <button
              onClick={() => handleAddEvent('a', 'view')}
              className="w-full px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-semibold transition"
            >
              👁️ View
            </button>
            <button
              onClick={() => handleAddEvent('a', 'conversion')}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              ✅ Convert
            </button>
          </div>

          {/* Variant B */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900 text-center">{variantB}</p>
            <button
              onClick={() => handleAddEvent('b', 'view')}
              className="w-full px-4 py-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-semibold transition"
            >
              👁️ View
            </button>
            <button
              onClick={() => handleAddEvent('b', 'conversion')}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
            >
              ✅ Convert
            </button>
          </div>
        </div>

        {/* Event Log */}
        {events.length > 0 && (
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
            <p className="text-xs font-semibold text-gray-700 mb-2">📋 Event Log (last 10)</p>
            <div className="space-y-1">
              {events.slice(-10).reverse().map((event, idx) => (
                <div key={idx} className="text-xs text-gray-600 flex justify-between">
                  <span>
                    {event.type === 'conversion' ? '✅' : '👁️'} Variant {event.variant.toUpperCase()} - {event.type}
                  </span>
                  <span className="text-gray-400">#{events.length - idx}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => setEvents([])}
            disabled={events.length === 0}
            className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold disabled:opacity-50"
          >
            Clear
          </button>
          <button
            onClick={handleSaveEvents}
            disabled={saving || events.length === 0}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <span className="animate-spin">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <span>💾</span>
                Save {events.length}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
