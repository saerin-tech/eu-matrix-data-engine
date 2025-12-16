import { Eye, EyeOff } from "lucide-react";
import { InputHTMLAttributes, useState } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string;
  error?: string;
  showCount?: boolean;
  showPasswordToggle?: boolean;
  helperText?: string;
}

export default function Input({
  label,
  error,
  showCount = false,
  showPasswordToggle = false,
  helperText,
  required = false,
  type = "text",
  maxLength,
  value = "",
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Determine actual input type
  const actualType = showPasswordToggle 
    ? (isPasswordVisible ? "text" : "password") 
    : type;

  // Determine counter text based on field type
  const getCounterText = () => {
    if (type === "tel" || props.placeholder?.toLowerCase().includes("contact")) {
      return "digits";
    }
    return "characters";
  };

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block mb-2 text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        <input
          type={actualType}
          value={value}
          required={required}
          maxLength={maxLength}
          aria-label={label}
          aria-required={required}
          aria-invalid={!!error}
          className={`w-full px-4 py-3 ${
            showPasswordToggle ? "pr-12" : ""
          } border ${
            error ? 'border-red-500' : 'border-gray-300'
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed`}
          {...props}
        />

        {/* Password Toggle Button */}
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            {isPasswordVisible ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* Character Counter */}
      {showCount && maxLength && (
        <p className="mt-1 text-xs text-gray-500">
          {String(value).length}/{maxLength} {getCounterText()}
        </p>
      )}

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