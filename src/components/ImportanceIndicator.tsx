'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { Importance } from '@/types/database';

interface ImportanceIndicatorProps {
  importance: Importance;
  metricId: string; // Used for API calls in parent component
  onUpdate: (importance: Importance) => Promise<void>;
}

const importanceOptions: { value: Importance; label: string; color: string }[] = [
  { value: 'green', label: 'Green', color: '#10B981' }, // success-500
  { value: 'amber', label: 'Amber', color: '#F59E0B' }, // warning-500
  { value: 'red', label: 'Red', color: '#EF4444' }, // error-500
];

export function ImportanceIndicator({ importance, metricId: _metricId, onUpdate }: ImportanceIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentImportance, setCurrentImportance] = useState<Importance>(importance);
  const [isUpdating, setIsUpdating] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Sync with prop changes
  useEffect(() => {
    setCurrentImportance(importance);
  }, [importance]);

  const handleSelect = async (newImportance: Importance) => {
    if (newImportance === currentImportance) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      // Optimistically update UI
      setCurrentImportance(newImportance);
      setIsOpen(false);
      
      // Persist to database
      await onUpdate(newImportance);
    } catch (error) {
      // Revert on error
      setCurrentImportance(importance);
      console.error('Error updating importance:', error);
      alert(error instanceof Error ? error.message : 'Failed to update importance');
    } finally {
      setIsUpdating(false);
    }
  };

  const currentOption = importanceOptions.find(opt => opt.value === currentImportance);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => !isUpdating && setIsOpen(!isOpen)}
        disabled={isUpdating}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: currentOption?.color || '#10B981' }}
        aria-label={`Importance: ${currentOption?.label || 'Green'}. Click to change.`}
        title={`Importance: ${currentOption?.label || 'Green'}`}
      >
        <span className="sr-only">{currentOption?.label || 'Green'}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-border-default rounded-md shadow-xl z-50 min-w-[120px] overflow-hidden">
          {importanceOptions.map((option) => {
            const isSelected = option.value === currentImportance;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-4 py-2 text-body transition-colors flex items-center gap-2 ${
                  isSelected
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: option.color }}
                />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

