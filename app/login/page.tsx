'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginCard from '../components/LoginCard';
import { Loader } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [seedEnabled, setSeedEnabled] = useState(false);
  const [seedCredentials, setSeedCredentials] = useState<{ user_name: string; user_password: string } | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if already logged in
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      router.push('/');
      return;
    }
    
    checkAndSeedUser();
  }, []);

  async function checkAndSeedUser() {
    try {
      // Check if SEED is enabled
      
      const seedEnv = process.env.NEXT_PUBLIC_SEED === 'TRUE';
      setSeedEnabled(seedEnv);

      if (seedEnv) {
        const response = await fetch('/api/auth/seed', {
          method: 'POST'
        });

        const result = await response.json();

        if (result.success) {
          if (result.credentials) {
            // New user was created - show in console
            setSeedCredentials(result.credentials);
            console.log('--------------------------------');
            console.log(' NEW USER CREATED!');
            console.log('user_name:', result.credentials.user_name);
            console.log('user_password:', result.credentials.user_password);
            console.log('--------------------------------');
          }
        } else {
          setSeedError(result.message);
        }
      }
    } catch (error) {
      console.error('Seed check failed:', error);
      setSeedError('Failed to check seed status');
    } finally {
      setLoading(false);
    }
  }

  function handleLoginSuccess(userId: string, userName: string) {
    // Store session
    sessionStorage.setItem('userId', userId);
    sessionStorage.setItem('userName', userName);
    
    // Redirect to main page
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <LoginCard
        seedEnabled={seedEnabled}
        seedCredentials={seedCredentials}
        seedError={seedError}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}