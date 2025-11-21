'use client';
import { Database, AlertCircle } from 'lucide-react';
import LoginForm from './LoginForm';
import SeedInfoCard from './SeedInfoCard';

interface Props {
  seedEnabled: boolean;
  seedCredentials: { user_name: string; user_password: string } | null;
  seedError: string | null;
  onLoginSuccess: (userId: string, userName: string) => void;
}

export default function LoginCard({ 
  seedEnabled, 
  seedCredentials, 
  seedError,
  onLoginSuccess 
}: Props) {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="p-3 bg-blue-100 rounded-full">
            <Database className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          {process.env.NEXT_PUBLIC_ORGANIZATION || 'EUmatrix'} Login
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Sign in to access the database explorer
        </p>

        {seedError && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <span>{seedError}</span>
          </div>
        )}

        <LoginForm onLoginSuccess={onLoginSuccess} />

        {seedEnabled && seedCredentials && (
          <SeedInfoCard 
            user_name={seedCredentials.user_name} 
            user_password={seedCredentials.user_password} 
          />
        )}
      </div>
    </div>
  );
}