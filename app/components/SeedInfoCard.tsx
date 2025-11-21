'use client';
import { CheckCircle, Copy, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface Props {
  user_name: string;
  user_password: string;
}

export default function SeedInfoCard({ user_name, user_password }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<'username' | 'password' | null>(null);

  function copyToClipboard(text: string, type: 'username' | 'password') {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold text-green-800">Seed User Created Successfully</h3>
      </div>
      
      <p className="text-sm text-green-700 mb-3">
        Use these credentials to login:
      </p>

      <div className="space-y-2">
        <div className="flex items-center gap-2 bg-white p-3 rounded border border-green-300">
          <span className="text-sm font-medium text-gray-600 w-24">Username:</span>
          <code className="flex-1 text-sm text-gray-800 font-bold">{user_name}</code>
          <button
            onClick={() => copyToClipboard(user_name, 'username')}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            type="button"
          >
            {copied === 'username' ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 bg-white p-3 rounded border border-green-300">
          <span className="text-sm font-medium text-gray-600 w-24">Password:</span>
          <code className="flex-1 text-sm text-gray-800 font-bold">
            {showPassword ? user_password : '••••••••••'}
          </code>
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            type="button"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-gray-600" />
            ) : (
              <Eye className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <button
            onClick={() => copyToClipboard(user_password, 'password')}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            type="button"
          >
            {copied === 'password' ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

