'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface EditableCellProps {
  metricId: string;
  year: number;
  month: number;
  value: number | null;
  onSave: () => void;
}

export function EditableCell({ metricId, year, month, value, onSave }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
    setEditValue(value?.toString() || '');
  };

  const handleBlur = async () => {
    if (isSaving) return;
    setIsEditing(false);
    await saveValue();
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await saveValue();
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(value?.toString() || '');
    }
  };

  const saveValue = async () => {
    const numericValue = editValue.trim() === '' ? null : parseFloat(editValue);
    
    // If value is the same, don't save
    if (numericValue === value) {
      return;
    }

    setIsSaving(true);

    try {
      if (numericValue === null || isNaN(numericValue)) {
        // Delete the value if empty
        const response = await fetch(
          `/api/metric-values?metric_id=${metricId}&year=${year}&month=${month}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete value');
        }
      } else {
        // Upsert the value
        const response = await fetch('/api/metric-values', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metric_id: metricId,
            year,
            month,
            value: numericValue,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save value');
        }
      }

      onSave();
    } catch (error) {
      console.error('Error saving value:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save value';
      // Revert to original value on error
      setEditValue(value?.toString() || '');
      alert(errorMessage); // Show error to user
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="p-4 text-center cursor-pointer hover:bg-primary-50 transition-colors"
      onClick={handleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="number"
          step="any"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full text-center border-2 border-primary-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={isSaving}
        />
      ) : (
        <span className="text-gray-900 font-medium">
          {value !== null ? (typeof value === 'number' ? value.toLocaleString() : value) : '-'}
        </span>
      )}
    </div>
  );
}

