'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Brand } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface InviteUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  brands: Brand[];
}

export function InviteUserForm({ isOpen, onClose, onSuccess, brands }: InviteUserFormProps) {
  const [email, setEmail] = useState('');
  const [brandId, setBrandId] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (brands.length > 0 && !brandId) {
      setBrandId(brands[0].id);
    }
  }, [brands, brandId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          brand_id: brandId,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to invite user');
      }

      setSuccess(true);
      setEmail('');
      setBrandId(brands[0]?.id || '');
      setRole('member');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite user');
    } finally {
      setIsLoading(false);
    }
  };

  const brandOptions = brands.map(brand => ({
    value: brand.id,
    label: brand.name,
  }));

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'member', label: 'Member' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite User to Brand"
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
            disabled={isLoading || !email.trim() || !brandId}
            loading={isLoading}
          >
            Send Invitation
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
            Invitation sent successfully!
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          required
          disabled={isLoading}
        />

        <Select
          label="Brand"
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          options={brandOptions}
          required
          disabled={isLoading}
        />

        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
          options={roleOptions}
          required
          disabled={isLoading}
        />
      </form>
    </Modal>
  );
}

