'use client';

import { useState, useRef, useEffect } from 'react';

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
  const [savedValue, setSavedValue] = useState<number | null>(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync editValue and savedValue when value prop changes (e.g., after reload)
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value?.toString() || '');
      setSavedValue(value);
    }
  }, [value, isEditing]);

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
      setIsEditing(false);
      await saveValue();
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

    // Optimistically update the displayed value
    setSavedValue(numericValue);
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

      // Show the saved value briefly before reloading
      await new Promise(resolve => setTimeout(resolve, 300));
      onSave();
    } catch (error) {
      console.error('Error saving value:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save value';
      // Revert to original value on error
      setSavedValue(value);
      setEditValue(value?.toString() || '');
      alert(errorMessage); // Show error to user
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
          className="w-full text-center border-2 border-primary-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          disabled={isSaving}
        />
      ) : isSaving ? (
        <span className="text-gray-900 font-medium flex items-center justify-center gap-2">
          <span>{savedValue !== null ? (typeof savedValue === 'number' ? savedValue.toLocaleString() : savedValue) : '-'}</span>
          <svg className="animate-spin h-4 w-4 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      ) : (
        <span className="text-gray-900 font-medium">
          {value !== null ? (typeof value === 'number' ? value.toLocaleString() : value) : '-'}
        </span>
      )}
    </div>
  );
}

