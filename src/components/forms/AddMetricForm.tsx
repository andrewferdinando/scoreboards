'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Brand } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface AddMetricFormProps {
  brands: Brand[];
  onSuccess: () => void;
  onClose: () => void;
}

export function AddMetricForm({ brands: initialBrands, onSuccess, onClose }: AddMetricFormProps) {
  const [name, setName] = useState('');
  const [brandId, setBrandId] = useState('');
  const [dataSource, setDataSource] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [loadingBrands, setLoadingBrands] = useState(false);

  // Fetch brands client-side as fallback
  useEffect(() => {
    if (initialBrands.length === 0) {
      setLoadingBrands(true);
      supabase
        .from('brands')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching brands:', error);
          } else if (data && data.length > 0) {
            setBrands(data as Brand[]);
            setBrandId(data[0].id);
          }
          setLoadingBrands(false);
        });
    } else {
      setBrands(initialBrands);
      setBrandId(initialBrands[0]?.id || '');
    }
  }, [initialBrands]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!brandId) {
      setError('Please select a brand');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brand_id: brandId,
          name: name.trim(),
          data_source: dataSource.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create metric');
      }

      // Show success state
      setSuccess(true);
      setIsLoading(false);
      
      // Wait a moment to show success, then close and reload
      setTimeout(() => {
        onClose();
        // Small delay to ensure form closes smoothly before reload
        setTimeout(() => {
          onSuccess();
        }, 100);
      }, 800);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create metric';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Add New Metric"
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
            form="add-metric-form"
            disabled={isLoading || success || brands.length === 0}
          >
            {isLoading ? 'Creating...' : success ? 'Created!' : 'Create Metric'}
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
          <span>Metric created successfully! Refreshing...</span>
        </div>
      )}

      <form id="add-metric-form" onSubmit={handleSubmit} className="space-y-4">
        {loadingBrands ? (
          <div className="input">Loading brands...</div>
        ) : brands.length === 0 ? (
          <div className="p-4 rounded-lg bg-error-50 border border-error-200 text-error-600 text-body-sm">
            No brands found. Please create a brand in Supabase first.
          </div>
        ) : (
          <Select
            label="Brand"
            options={brands.map(brand => ({ value: brand.id, label: brand.name }))}
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            required
          />
        )}

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
