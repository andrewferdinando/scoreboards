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
  const [displayValue, setDisplayValue] = useState<number | null>(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync editValue and displayValue when value prop changes (e.g., after reload)
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value?.toString() || '');
      setDisplayValue(value);
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

  const handleBlur = () => {
    setIsEditing(false);
    saveValue();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsEditing(false);
      saveValue();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(value?.toString() || '');
      setDisplayValue(value);
    }
  };

  const saveValue = () => {
    const numericValue = editValue.trim() === '' ? null : parseFloat(editValue);
    
    // If value is the same, don't save
    if (numericValue === value) {
      return;
    }

    // Update the displayed value instantly (optimistic update)
    setDisplayValue(numericValue);

    // Save in the background
    (async () => {
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

        // Reload after save completes
        onSave();
      } catch (error) {
        console.error('Error saving value:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to save value';
        // Revert to original value on error
        setDisplayValue(value);
        setEditValue(value?.toString() || '');
        alert(errorMessage); // Show error to user
      }
    })();
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
        />
      ) : (
        <span className="text-gray-900 font-medium">
          {displayValue !== null ? (typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue) : '-'}
        </span>
      )}
    </div>
  );
}

