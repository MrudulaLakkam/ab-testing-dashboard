'use client';

import { useState } from 'react';
import { supabase } from './supabaseClient';

export function ExperimentForm() {
  const [formData, setFormData] = useState({
    name: '',
    hypothesis: '',
    variantA: 'Control',
    variantB: 'Treatment',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.hypothesis.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Save experiment to database
      const { data, error: insertError } = await supabase
        .from('experiments')
        .insert([
          {
            name: formData.name,
            hypothesis: formData.hypothesis,
            variant_a: formData.variantA,
            variant_b: formData.variantB,
            status: 'draft',
          }
        ])
        .select();

      if (insertError) {
        throw insertError;
      }

      console.log('Experiment created:', data);
      setSuccessMessage(`✅ Experiment "${formData.name}" created successfully!`);
      setSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({ name: '', hypothesis: '', variantA: 'Control', variantB: 'Treatment' });
        setSubmitted(false);
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create experiment');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Create New Experiment</h2>
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 border-2 border-green-500 rounded-lg animate-pulse">
          <p className="text-green-800 font-bold text-lg">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 rounded-lg">
          <p className="text-red-800 font-semibold">❌ Error</p>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Experiment Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Experiment Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Homepage Button Color Test"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">Give your experiment a descriptive name</p>
        </div>

        {/* Hypothesis */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Hypothesis *
          </label>
          <textarea
            name="hypothesis"
            value={formData.hypothesis}
            onChange={handleChange}
            placeholder="e.g., Changing the button color to red will increase click-through rate by 10%"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">Describe what you expect to happen and why</p>
        </div>

        {/* Variant A */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Variant A (Control)
          </label>
          <input
            type="text"
            name="variantA"
            value={formData.variantA}
            onChange={handleChange}
            placeholder="e.g., Blue Button"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">The original version (control group)</p>
        </div>

        {/* Variant B */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Variant B (Treatment)
          </label>
          <input
            type="text"
            name="variantB"
            value={formData.variantB}
            onChange={handleChange}
            placeholder="e.g., Red Button"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">The variation to test</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Experiment'}
        </button>
      </form>

      {/* Form Preview */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-3">Form Data Preview:</h3>
        <pre className="text-xs bg-white p-3 rounded border border-gray-300 overflow-x-auto">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>
    </div>
  );
}