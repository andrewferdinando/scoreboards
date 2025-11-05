'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database';

export function UserMenu() {
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Ensure component is mounted before rendering (prevents hydration mismatch)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let mounted = true;
    
    // Get current user
    async function fetchUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting user:', error);
          setIsLoading(false);
          return;
        }
        
        if (user) {
          setUser({
            email: user.email || '',
            name: user.user_metadata?.name || undefined,
          });
          
          // Fetch profile
          try {
            const { data, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
            
            if (!mounted) return;
            
            if (!profileError && data) {
              setProfile(data);
            }
          } catch (err) {
            if (!mounted) return;
            console.error('Error fetching profile:', err);
          } finally {
            if (mounted) {
              setIsLoading(false);
            }
          }
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Error in getUser:', err);
        setIsLoading(false);
      }
    }
    
    fetchUser();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Get initials for avatar
  const getInitials = () => {
    if (profile?.name) {
      return profile.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };


  // Don't render until mounted (prevents hydration mismatch)
  if (!isMounted || isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-neutral-200 animate-pulse" />
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-body-sm font-medium text-neutral-700 hover:bg-neutral-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
        aria-label="User menu"
      >
        {getInitials()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-border-default z-50">
          <div className="p-4 border-b border-border-default">
            <div className="text-body font-semibold text-neutral-900">
              {profile?.name || 'User'}
            </div>
            <div className="text-body-sm text-neutral-500 mt-1">
              {user?.email}
            </div>
          </div>
          
          <div className="p-2">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2 text-body text-neutral-700 hover:bg-neutral-50 rounded-md transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

