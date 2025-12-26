import { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  placeholder?: string;
}

export default function Select({ 
  label,
  options,
  error,
  helperText,
  placeholder,
  required = false,
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block mb-2 text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Select Dropdown */}
      <select
        required={required}
        aria-label={label}
        aria-required={required}
        aria-invalid={!!error}
        className={`w-full px-4 py-3 border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed`}
        {...props}
      >
        {/* Placeholder Option */}
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        
        {/* Options */}
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Helper Text */}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-600">
          {helperText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}