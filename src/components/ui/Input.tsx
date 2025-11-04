import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  numeric?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  numeric = false,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="label">
          {label}
          {props.required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={`input ${numeric ? 'input-number' : ''} ${error ? 'border-error-500 focus:ring-error-500/20' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-caption text-error-600 mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-caption text-neutral-500 mt-1">{helperText}</p>
      )}
    </div>
  );
}

