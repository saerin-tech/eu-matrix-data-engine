'use client';
import { useState, FormEvent } from 'react';
import { LogIn, Loader, AlertCircle } from 'lucide-react';
import { LoginCredentials } from '../types/auth';

interface Props {
  onLoginSuccess: (userId: string, userName: string) => void;
}

export default function LoginForm({ onLoginSuccess }: Props) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    user_name: '',
    user_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const result = await response.json();

      if (result.success && result.user) {
        onLoginSuccess(result.user.id, result.user.user_name);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-2 text-sm font-semibold text-gray-700">
          Username
        </label>
        <input
          type="text"
          value={credentials.user_name}
          onChange={(e) => setCredentials({ ...credentials, user_name: e.target.value })}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
          placeholder="Enter username"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-semibold text-gray-700">
          Password
        </label>
        <input
          type="password"
          value={credentials.user_password}
          onChange={(e) => setCredentials({ ...credentials, user_password: e.target.value })}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
          placeholder="Enter password"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <LogIn className="w-5 h-5" />
            Sign In
          </>
        )}
      </button>
    </form>
  );
}