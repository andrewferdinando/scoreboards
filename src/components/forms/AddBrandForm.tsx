'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface AddBrandFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddBrandForm({ isOpen, onClose, onSuccess }: AddBrandFormProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create brand');
      }

      setSuccess(true);
      setName('');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create brand');
    } finally {
      setIsLoading(false);
    }
  };

  const [success, setSuccess] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Brand"
      footer={
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading || !name.trim()}
            loading={isLoading}
          >
            Add Brand
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-error-50 border border-error-500 rounded-md text-error-600 text-body-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-success-50 border border-success-500 rounded-md text-success-600 text-body-sm">
            Brand created successfully!
          </div>
        )}

        <Input
          label="Brand Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter brand name"
          required
          disabled={isLoading}
        />
      </form>
    </Modal>
  );
}

