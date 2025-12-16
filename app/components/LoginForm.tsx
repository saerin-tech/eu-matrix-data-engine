import { useState, FormEvent } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';
import Button from './shared/Button';
import Input from './shared/Input';

interface LoginCredentials {
  user_name: string;
  user_password: string;
}

interface Props {
  onLoginSuccess: (userId: string, userName: string, userRole: string) => void;
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
        onLoginSuccess(
          result.user.id, 
          result.user.user_name,
          result.user.roles_and_rights
        );
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
      <Input
        label="Username"
          type="text"
          value={credentials.user_name}
          onChange={(e) => setCredentials({ ...credentials, user_name: e.target.value })}
          required
          placeholder="Enter username"
        autoComplete="username"
      />

      {/* Password Input with Toggle */}
      <Input
        label="Password"
        type="password"
          value={credentials.user_password}
          onChange={(e) => setCredentials({ ...credentials, user_password: e.target.value })}
          required
        placeholder="Enter password"
        showPasswordToggle
        autoComplete="current-password"
      />

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        loading={loading}
        fullWidth
        icon={!loading ? <LogIn className="w-5 h-5" /> : undefined}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}