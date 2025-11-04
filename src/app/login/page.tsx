'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log('Attempting to sign in with email:', email);
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        setError(signInError.message || 'Invalid email or password');
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        console.error('No user data returned');
        setError('Sign in failed - no user data');
        setIsLoading(false);
        return;
      }

      console.log('Sign in successful, user:', data.user.email);
      
      // Wait a moment for session to be persisted
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify session is set
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('Session confirmed, redirecting...');
        window.location.href = '/';
      } else {
        console.error('Session not found after sign in');
        setError('Session not established. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Sign in failed with exception:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-h1 font-bold text-neutral-900 mb-2">Scoreboards</h1>
          <p className="text-body text-neutral-600">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-error-50 border border-error-200 text-error-600 text-body-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          <Button
            variant="primary"
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

