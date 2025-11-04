'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AddMetricValueFormProps {
  metricId: string;
  initialYear?: number;
  initialMonth?: number;
  onSuccess: () => void;
  onClose: () => void;
}

export function AddMetricValueForm({ metricId, initialYear, initialMonth, onSuccess, onClose }: AddMetricValueFormProps) {
  const currentDate = new Date();
  const [year, setYear] = useState(initialYear ?? currentDate.getFullYear());
  const [month, setMonth] = useState(initialMonth ?? currentDate.getMonth() + 1);
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const numericValue = parseFloat(value);
      if (isNaN(numericValue)) {
        throw new Error('Value must be a number');
      }

      const { error: insertError } = await supabase
        .from('metric_values')
        .insert({
          metric_id: metricId,
          year,
          month,
          value: numericValue,
        });

      if (insertError) throw insertError;

      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add metric value';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Add Metric Value</h2>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="year" className="label label-required">
                  Year
                </label>
                <input
                  id="year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="input"
                  min="2000"
                  max="2100"
                  required
                />
              </div>

              <div>
                <label htmlFor="month" className="label label-required">
                  Month
                </label>
                <select
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="input"
                  required
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="value" className="label label-required">
                Value
              </label>
              <input
                id="value"
                type="number"
                step="any"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="input"
                placeholder="0.00"
                required
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
                {isLoading ? 'Adding...' : 'Add Value'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

