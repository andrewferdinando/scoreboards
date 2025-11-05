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
    e.stopPropagation();
    setError(null);
    setIsLoading(true);

    // Only store debug info if we're debugging (not in normal flow)
    // sessionStorage.setItem('login_debug', JSON.stringify({ step: 'starting', email }));

    try {
      // Debug: sessionStorage.setItem('login_debug', JSON.stringify({ step: 'calling_signInWithPassword', email }));
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Debug: sessionStorage.setItem('login_debug', JSON.stringify({ 
      //   step: 'signIn_response', 
      //   hasError: !!signInError,
      //   hasUser: !!data?.user,
      //   error: signInError?.message 
      // }));

      if (signInError) {
        setError(signInError.message || 'Invalid email or password');
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        setError('Sign in failed - no user data');
        setIsLoading(false);
        return;
      }
      
      // Wait a moment for session to be persisted
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Verify session is set
      const { data: { session } } = await supabase.auth.getSession();
      // Debug: sessionStorage.setItem('login_debug', JSON.stringify({ 
      //   step: 'session_check', 
      //   hasSession: !!session,
      //   userId: session?.user?.id 
      // }));

      if (session) {
        // Clear debug info on successful login
        sessionStorage.removeItem('login_debug');
        // Clear any error state before redirecting
        setError(null);
        // Use window.location for reliable redirect
        window.location.href = '/';
        return; // Exit early to prevent any further execution
      } else {
        setError('Session not established. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      // Only store debug info on actual errors
      if (err instanceof Error) {
        sessionStorage.setItem('login_debug', JSON.stringify({ 
          step: 'exception', 
          error: err.message 
        }));
      }
      
      // Only show error if it's not a redirect-related issue
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      if (!errorMessage.includes('redirect') && !errorMessage.includes('navigation')) {
        setError(errorMessage);
      }
      setIsLoading(false);
      
      // If we have a session despite the error, redirect anyway
      try {
        const { data: { session: checkSession } } = await supabase.auth.getSession();
        if (checkSession) {
          window.location.href = '/';
        }
      } catch {
        // Ignore check errors
      }
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

        {/* Debug info - only show if there's an error or if explicitly enabled */}
        {typeof window !== 'undefined' && error && sessionStorage.getItem('login_debug') && (
          <div className="mb-4 p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-600 text-body-sm font-mono text-xs">
            <div className="font-semibold mb-1">Debug Info:</div>
            <pre>{sessionStorage.getItem('login_debug')}</pre>
            <button
              type="button"
              onClick={() => sessionStorage.removeItem('login_debug')}
              className="mt-2 text-xs text-primary-600 hover:text-primary-700"
            >
              Clear
            </button>
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

