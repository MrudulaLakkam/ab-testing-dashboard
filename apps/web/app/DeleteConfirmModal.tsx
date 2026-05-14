'use client';

import { useState } from 'react';
import { supabase } from './supabaseClient';
import { X, AlertCircle, Trash2, Loader2, CheckCircle2 } from 'lucide-react';

interface Props {
  experimentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteConfirmModal({ experimentId, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      // Delete all events for this experiment
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('experiment_id', experimentId);

      if (deleteError) throw deleteError;

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to delete events');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center space-y-4 border border-gray-200">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Events Deleted!</h3>
          <p className="text-gray-600">
            All test events have been removed from this experiment
          </p>
          <div className="bg-emerald-50 rounded-lg p-4 text-sm text-emerald-700">
            You can record new events anytime
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 space-y-6 border border-gray-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shadow-lg flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-gray-900">Delete Events?</h2>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-600 hover:text-gray-900 flex-shrink-0 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl border border-red-200 bg-red-50">
            <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold">!</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Warning Message */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 space-y-2">
          <p className="text-sm font-semibold text-amber-900">⚠️ Warning</p>
          <p className="text-sm text-amber-800">
            This will permanently delete all recorded test events for this experiment. Your experiment configuration will remain intact.
          </p>
        </div>

        {/* Stats Preview */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-red-600" /> What will be deleted
          </p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              All user events and conversions
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              All event timestamps and data
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              All related analytics
            </li>
          </ul>
        </div>

        {/* What stays */}
        <div className="bg-emerald-50 rounded-2xl p-4 space-y-2">
          <p className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> What stays
          </p>
          <p className="text-sm text-emerald-800">
            Your experiment configuration, name, hypothesis, and variant details will remain unchanged.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:scale-[1.02] active:scale-[0.98] font-semibold text-sm shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" /> Delete events
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
