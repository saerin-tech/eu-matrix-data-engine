import { useState, FormEvent } from 'react';
import { LogIn, AlertCircle, Lock } from 'lucide-react';
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
  const [isAccountDisabled, setIsAccountDisabled] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsAccountDisabled(false);

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
        // Check if account is disabled (403 status)
        if (response.status === 403) {
          setIsAccountDisabled(true);
        }
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
         disabled={loading}
      />

      <Input
        label="Password"
        type="password"
          value={credentials.user_password}
          onChange={(e) => setCredentials({ ...credentials, user_password: e.target.value })}
          required
        placeholder="Enter password"
        showPasswordToggle
        autoComplete="current-password"
         disabled={loading}
      />

      {/* Error Message */}
      {error && (
        <div className={`p-3 border rounded-lg text-sm flex items-start gap-3 ${
            isAccountDisabled 
              ? 'bg-orange-50 border-orange-200 text-orange-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {isAccountDisabled ? (
              <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
          <div>
            <p className="font-semibold">
              {isAccountDisabled ? 'Account Disabled' : 'Login Failed'}
            </p>
            <p className="text-xs mt-1">{error}</p>
          </div>
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