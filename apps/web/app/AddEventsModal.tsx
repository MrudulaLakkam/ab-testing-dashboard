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

export function AddEventsModal({ experimentId, variantA, variantB, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    variantAViews: 500,
    variantAConversions: 100,
    variantBViews: 500,
    variantBConversions: 125,
  });

  const handleAddEvents = async () => {
    setLoading(true);
    try {
      // Generate events for Variant A
      const eventsA = Array.from({ length: formData.variantAViews }, (_, i) => ({
        experiment_id: experimentId,
        user_id: `user_${Math.random().toString(36).substr(2, 9)}`,
        variant: 'a',
        event_type: i < formData.variantAConversions ? 'conversion' : 'view',
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      }));

      // Generate events for Variant B
      const eventsB = Array.from({ length: formData.variantBViews }, (_, i) => ({
        experiment_id: experimentId,
        user_id: `user_${Math.random().toString(36).substr(2, 9)}`,
        variant: 'b',
        event_type: i < formData.variantBConversions ? 'conversion' : 'view',
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      }));

      const allEvents = [...eventsA, ...eventsB];

      // Insert events
      const { error } = await supabase.from('events').insert(allEvents);

      if (error) throw error;

      alert(`✅ Added ${allEvents.length} events successfully!`);
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Add Test Events</h2>
        <p className="text-sm text-gray-600">
          Generate sample events for {variantA} vs {variantB}
        </p>

        <div className="space-y-4">
          {/* Variant A */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-gray-900 mb-2">Variant A: {variantA}</h3>
            <div className="space-y-2">
              <div>
                <label className="text-sm text-gray-600">Views</label>
                <input
                  type="number"
                  value={formData.variantAViews}
                  onChange={(e) => setFormData({ ...formData, variantAViews: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Conversions</label>
                <input
                  type="number"
                  value={formData.variantAConversions}
                  onChange={(e) => setFormData({ ...formData, variantAConversions: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Variant B */}
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-gray-900 mb-2">Variant B: {variantB}</h3>
            <div className="space-y-2">
              <div>
                <label className="text-sm text-gray-600">Views</label>
                <input
                  type="number"
                  value={formData.variantBViews}
                  onChange={(e) => setFormData({ ...formData, variantBViews: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Conversions</label>
                <input
                  type="number"
                  value={formData.variantBConversions}
                  onChange={(e) => setFormData({ ...formData, variantBConversions: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Preview */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">Preview:</p>
          <div className="text-xs space-y-1">
            <p>Variant A: {((formData.variantAConversions / formData.variantAViews) * 100).toFixed(1)}% conversion</p>
            <p>Variant B: {((formData.variantBConversions / formData.variantBViews) * 100).toFixed(1)}% conversion</p>
            <p>Lift: {(((formData.variantBConversions / formData.variantBViews) - (formData.variantAConversions / formData.variantAViews)) / (formData.variantAConversions / formData.variantAViews) * 100).toFixed(1)}%</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleAddEvents}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm disabled:bg-gray-400"
          >
            {loading ? 'Adding...' : 'Add Events'}
          </button>
        </div>
      </div>
    </div>
  );
}
