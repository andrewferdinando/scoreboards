'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Brand } from '@/types/database';

interface AddMetricFormProps {
  brands: Brand[];
  onSuccess: () => void;
  onClose: () => void;
}

export function AddMetricForm({ brands, onSuccess, onClose }: AddMetricFormProps) {
  const [name, setName] = useState('');
  const [brandId, setBrandId] = useState(brands[0]?.id || '');
  const [dataSource, setDataSource] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('metrics')
        .insert({
          brand_id: brandId,
          name: name.trim(),
          data_source: dataSource.trim() || null,
        });

      if (insertError) throw insertError;

      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create metric';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Add New Metric</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-error-50 border border-error-200 text-error-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="brand" className="label label-required">
                Brand
              </label>
              <select
                id="brand"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="input"
                required
              >
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="name" className="label label-required">
                Metric Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="e.g., Website Visitors"
                required
              />
            </div>

            <div>
              <label htmlFor="dataSource" className="label">
                Data Source
              </label>
              <input
                id="dataSource"
                type="text"
                value={dataSource}
                onChange={(e) => setDataSource(e.target.value)}
                className="input"
                placeholder="e.g., Google Analytics"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Metric'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

