'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import {
  useHasPermission,
  useHasAnyPermission,
  useMyPermissions
} from '@/hooks/usePermissions';
import { getDashboardRoute } from '@/lib/auth-utils';
import { Loader2, ShieldX } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: number;
  requiredPermission?: string;
  requiredAnyPermissions?: string[];
  redirectTo?: string;
  showUnauthorizedMessage?: boolean;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  requiredAnyPermissions,
  redirectTo,
  showUnauthorizedMessage = true
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const { data: permissions, isLoading: permissionsLoading } =
    useMyPermissions();

  // Check permissions
  const hasSinglePermission = useHasPermission(requiredPermission || '');
  const hasAnyPermission = useHasAnyPermission(requiredAnyPermissions || []);

  useEffect(() => {
    // Wait for auth, profile, and permissions to load
    if (authLoading || profileLoading || permissionsLoading) return;

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
        router.push(redirectTo || userDashboard);
        return;
      }

      // Check permission-based access
      const hasAccess =
        (!requiredPermission && !requiredAnyPermissions) ||
        (requiredPermission && hasSinglePermission) ||
        (requiredAnyPermissions && hasAnyPermission);

      if (!hasAccess && redirectTo) {
        router.push(redirectTo);
        return;
      }
    }
  }, [
    isAuthenticated,
    authLoading,
    profileLoading,
    permissionsLoading,
    profile,
    requiredRole,
    requiredPermission,
    requiredAnyPermissions,
    hasSinglePermission,
    hasAnyPermission,
    redirectTo,
    router
  ]);

  // Show loading state
  if (authLoading || profileLoading || permissionsLoading) {
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

  // Check permission-based access
  const hasAccess =
    (!requiredPermission && !requiredAnyPermissions) ||
    (requiredPermission && hasSinglePermission) ||
    (requiredAnyPermissions && hasAnyPermission);

  if (!hasAccess) {
    if (!showUnauthorizedMessage) {
      return null;
    }

    return (
      <div className='flex min-h-[400px] items-center justify-center p-4'>
        <Alert className='border-destructive/50 bg-destructive/10 max-w-2xl'>
          <ShieldX className='h-5 w-5' />
          <AlertTitle className='text-lg font-semibold'>
            Access Denied
          </AlertTitle>
          <AlertDescription className='mt-2 space-y-4'>
            <p>
              You do not have permission to access this page. Please contact
              your administrator if you believe this is an error.
            </p>
            {requiredPermission && (
              <p className='text-muted-foreground text-sm'>
                Required permission: <code>{requiredPermission}</code>
              </p>
            )}
            {requiredAnyPermissions && (
              <p className='text-muted-foreground text-sm'>
                Required any of:{' '}
                <code>{requiredAnyPermissions.join(', ')}</code>
              </p>
            )}
            <div className='flex gap-2'>
              <Button onClick={() => router.back()} variant='outline'>
                Go Back
              </Button>
              <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
}

/**
 * Hook to programmatically check permissions and redirect if needed
 */
export function useRequirePermission(
  permission: string,
  redirectTo: string = '/dashboard'
) {
  const router = useRouter();
  const hasPermission = useHasPermission(permission);

  useEffect(() => {
    if (!hasPermission) {
      router.push(redirectTo);
    }
  }, [hasPermission, redirectTo, router]);

  return hasPermission;
}
