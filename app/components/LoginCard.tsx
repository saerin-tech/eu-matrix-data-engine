'use client';
import { Database, AlertCircle } from 'lucide-react';
import LoginForm from './LoginForm';

interface Props {
  onLoginSuccess: (userId: string, userName: string) => void;
}

export default function LoginCard({ 
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

        <LoginForm onLoginSuccess={onLoginSuccess} />

      </div>
    </div>
  );
}