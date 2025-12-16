import { Loader } from 'lucide-react';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: 'primary' | 'success' | 'danger' | 'secondary' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
  fullWidth?: boolean;
}

export default function Button({ 
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  // Base classes for all buttons
  const baseClasses = 'cursor-pointer font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Variant color schemes
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-600/30',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-600/30',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-600/30',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg hover:shadow-yellow-600/30',
    info: 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-purple-600/30'
  };
  
  // Size variations
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  // Width classes
  const widthClass = fullWidth ? 'w-full' : 'w-auto';

  return (
    <button
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}   