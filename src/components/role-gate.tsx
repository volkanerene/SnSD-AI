'use client';

import { useProfile } from '@/hooks/useProfile';
import { hasPermission, hasSpecificPermission } from '@/lib/auth-utils';
import type { RoleLevel } from '@/lib/auth-utils';

interface RoleGateProps {
  children: React.ReactNode;
  requiredRole?: RoleLevel;
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user's role or permissions
 * Use this for showing/hiding UI elements based on role
 */
export function RoleGate({
  children,
  requiredRole,
  requiredPermission,
  fallback = null
}: RoleGateProps) {
  const { profile, isLoading } = useProfile();

  // Show nothing while loading
  if (isLoading) {
    return null;
  }

  // Show fallback if no profile
  if (!profile) {
    return <>{fallback}</>;
  }

  // Check role-based permission
  if (requiredRole !== undefined) {
    if (!hasPermission(profile.role_id, requiredRole)) {
      return <>{fallback}</>;
    }
  }

  // Check specific permission
  if (requiredPermission) {
    if (!hasSpecificPermission(profile.role_id, requiredPermission)) {
      return <>{fallback}</>;
    }
  }

  // Render children if checks pass
  return <>{children}</>;
}
