'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

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
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Add Metric Value"
      className="max-w-md"
      footer={
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="add-metric-value-form"
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Value'}
          </Button>
        </div>
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error-50 border border-error-200 text-error-600 text-body-sm">
          {error}
        </div>
      )}

      <form id="add-metric-value-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Year"
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            min="2000"
            max="2100"
            required
            numeric
          />

          <Select
            label="Month"
            options={months.map(m => ({ value: m.value.toString(), label: m.label }))}
            value={month.toString()}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            required
          />
        </div>

        <Input
          label="Value"
          type="number"
          step="any"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0.00"
          required
          numeric
        />
      </form>
    </Modal>
  );
}

