'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { canAccessRoute, getDashboardRoute } from '@/lib/auth-utils';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: number;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();

  useEffect(() => {
    // Wait for auth and profile to load
    if (authLoading || profileLoading) return;

    // Redirect to sign-in if not authenticated
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
      return;
    }

    // Check role-based access if profile is loaded
    if (profile) {
      // Check if user has required role level
      if (requiredRole !== undefined && profile.role_id > requiredRole) {
        // User doesn't have permission, redirect to their dashboard
        const userDashboard = getDashboardRoute(profile.role_id);
        router.push(userDashboard);
        return;
      }

      // Check if custom redirect is needed
      if (redirectTo) {
        router.push(redirectTo);
        return;
      }
    }
  }, [
    isAuthenticated,
    authLoading,
    profileLoading,
    profile,
    requiredRole,
    redirectTo,
    router
  ]);

  // Show loading state
  if (authLoading || profileLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='text-primary h-8 w-8 animate-spin' />
          <p className='text-muted-foreground text-sm'>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or no profile
  if (!isAuthenticated || !profile) {
    return null;
  }

  // Check role permission
  if (requiredRole !== undefined && profile.role_id > requiredRole) {
    return null;
  }

  // Render children if all checks pass
  return <>{children}</>;
}
