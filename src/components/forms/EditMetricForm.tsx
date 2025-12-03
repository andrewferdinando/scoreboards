'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Metric } from '@/types/database';

interface EditMetricFormProps {
  metric: Metric;
  onSuccess: () => void;
  onClose: () => void;
}

export function EditMetricForm({ metric, onSuccess, onClose }: EditMetricFormProps) {
  const [name, setName] = useState(metric.name);
  const [dataSource, setDataSource] = useState(metric.data_source || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Check if values actually changed
    if (name.trim() === metric.name && dataSource.trim() === (metric.data_source || '')) {
      setIsLoading(false);
      onClose();
      return;
    }

    try {
      const response = await fetch(`/api/metrics/${metric.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          data_source: dataSource.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update metric');
      }

      // Show success state
      setSuccess(true);
      setIsLoading(false);
      
      // Wait a moment to show success, then close
      setTimeout(() => {
        onClose();
        onSuccess();
      }, 500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update metric';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Edit Metric"
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
            form="edit-metric-form"
            disabled={isLoading || success}
          >
            {isLoading ? 'Updating...' : success ? 'Updated!' : 'Update Metric'}
          </Button>
        </div>
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error-50 border border-error-200 text-error-600 text-body-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-lg bg-success-50 border border-success-200 text-success-600 text-body-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Metric updated successfully!</span>
        </div>
      )}

      <form id="edit-metric-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Metric Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Website Visitors"
          required
        />

        <Input
          label="Data Source"
          type="text"
          value={dataSource}
          onChange={(e) => setDataSource(e.target.value)}
          placeholder="e.g., Google Analytics"
        />
      </form>
    </Modal>
  );
}

