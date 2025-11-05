import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}: ToggleProps) {
  return (
    <label className={`flex items-center gap-2 ${className}`}>
      {label && (
        <span className="text-body-sm font-medium text-neutral-700">
          {label}
        </span>
      )}
      <div className="toggle">
        <input
          type="checkbox"
          className="toggle-input"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <span className="toggle-slider" />
      </div>
    </label>
  );
}



