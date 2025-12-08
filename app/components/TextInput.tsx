import { Eye, EyeOff } from "lucide-react";
import { InputHTMLAttributes } from "react";

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errorMessage?: string;
  showCount?: boolean;
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onTogglePassword?: () => void;
}

export default function TextInput({
  label,
  value,
  onChange,
  errorMessage,
  showCount = false,
  showPasswordToggle = false,
  isPasswordVisible = false,
  onTogglePassword,
  required = false,
  type = "text",
  placeholder,
  minLength,
  maxLength,
  ...rest
}: TextInputProps) {
  const actualType = showPasswordToggle 
    ? (isPasswordVisible ? "text" : "password") 
    : type;

  // Determine counter text based on field type
  const getCounterText = () => {
    if (type === "tel" || placeholder?.toLowerCase().includes("contact")) {
      return "digits";
    }
    return "characters";
  };

  return (
    <div>
      <label className="block mb-2 text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          type={actualType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          aria-label={label}
          aria-required={required}
          aria-invalid={!!errorMessage}
          className={`w-full px-4 py-3 ${
            showPasswordToggle ? "pr-12" : ""
          } border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed`}
          {...rest}
        />

        {showPasswordToggle && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
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

      {showCount && maxLength && (
        <p className="mt-1 text-xs text-gray-500">
          {String(value).length}/{maxLength} {getCounterText()}
        </p>
      )}

      {errorMessage && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}