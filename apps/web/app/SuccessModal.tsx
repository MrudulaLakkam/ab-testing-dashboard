'use client';

import { CheckCircle2, ArrowLeft } from 'lucide-react';

interface SuccessModalProps {
  experimentName: string;
  primaryMetric: string;
  audience: string;
  trafficSplitA: number;
  trafficSplitB: number;
  sampleSize: number;
  estimatedDays: number;
  expectedLift: number;
  onBackClick: () => void;
}

export function SuccessModal({
  experimentName,
  primaryMetric,
  audience,
  trafficSplitA,
  trafficSplitB,
  sampleSize,
  estimatedDays,
  expectedLift,
  onBackClick,
}: SuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6 border border-gray-200">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">
            Experiment Created! 🎉
          </h2>
          <p className="text-gray-600">
            Your experiment is ready to go
          </p>
        </div>

        {/* Experiment Details */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 space-y-4 border border-blue-200">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-1">
              Experiment Name
            </p>
            <p className="text-lg font-bold text-gray-900">
              {experimentName}
            </p>
          </div>

          <div className="border-t border-blue-200 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Primary Metric</p>
              <p className="text-sm font-semibold text-gray-900">
                {primaryMetric}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Audience</p>
              <p className="text-sm font-semibold text-gray-900">
                {audience}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Status</p>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wide">
                Draft
              </span>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Traffic Split</p>
              <p className="text-sm font-semibold text-gray-900">
                {trafficSplitA}% / {trafficSplitB}%
              </p>
            </div>
          </div>
        </div>

        {/* Stats Preview */}
        <div className="bg-blue-50 rounded-2xl p-4 space-y-3">
          <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold">
            Quick Stats
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Sample Size</p>
              <p className="text-sm font-bold text-gray-900">
                ~{sampleSize.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Duration</p>
              <p className="text-sm font-bold text-gray-900">
                {estimatedDays}d
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Expected Lift</p>
              <p className="text-sm font-bold text-gray-900">
                +{expectedLift}%
              </p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-amber-50 rounded-2xl p-4 space-y-2 border border-amber-200">
          <p className="text-sm font-semibold text-amber-900">💡 Next Steps</p>
          <ul className="text-xs text-amber-800 space-y-1">
            <li>✓ Configure your traffic allocation in the experiment settings</li>
            <li>✓ Record test events to start analyzing</li>
            <li>✓ Monitor results daily for statistical significance</li>
          </ul>
        </div>

        {/* Button */}
        <button
          onClick={onBackClick}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:scale-[1.02] active:scale-[0.98] font-semibold text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>
    </div>
  );
}
