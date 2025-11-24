'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginCard from '../components/LoginCard';
import { Loader } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
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
      if (seedEnv) {
        const response = await fetch('/api/auth/seed', {
          method: 'POST'
        });

      }
    } catch (error) {
      console.error('Seed check failed:', error);
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
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}