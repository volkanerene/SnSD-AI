'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useMyPermissions } from '@/hooks/usePermissions';

interface PermissionContextType {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  isLoading: boolean;
  error: Error | null;
  userRole: string | null;
  roleId: number | null;
}

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, error } = useMyPermissions();

  // Debug: Log permissions data
  React.useEffect(() => {
    if (data) {
      console.log('🔐 [PermissionContext] Loaded permissions:', {
        role_id: data.role_id,
        role_name: data.role_name,
        permissions_count: data.permissions?.length || 0,
        permissions: data.permissions
      });
    }
  }, [data]);

  const hasPermission = React.useCallback(
    (permission: string) => {
      const result = data?.permissions?.includes(permission) ?? false;
      if (!result && data?.permissions) {
        console.log('🚫 [PermissionContext] Missing permission:', permission);
      }
      return result;
    },
    [data?.permissions]
  );

  const hasAnyPermission = React.useCallback(
    (permissions: string[]) => {
      if (!data?.permissions) return false;
      return permissions.some((p) => data.permissions.includes(p));
    },
    [data?.permissions]
  );

  const hasAllPermissions = React.useCallback(
    (permissions: string[]) => {
      if (!data?.permissions) return false;
      return permissions.every((p) => data.permissions.includes(p));
    },
    [data?.permissions]
  );

  const contextValue: PermissionContextType = React.useMemo(
    () => ({
      permissions: data?.permissions ?? [],
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      isLoading,
      error: error as Error | null,
      userRole: data?.role_name ?? null,
      roleId: data?.role_id ?? null
    }),
    [data, isLoading, error, hasPermission, hasAnyPermission, hasAllPermissions]
  );

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissionContext() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error(
      'usePermissionContext must be used within a PermissionProvider'
    );
  }
  return context;
}

// Convenience components for conditional rendering
interface CanProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ permission, children, fallback = null }: CanProps) {
  const { hasPermission } = usePermissionContext();
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}

interface CanAnyProps {
  permissions: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function CanAny({
  permissions,
  children,
  fallback = null
}: CanAnyProps) {
  const { hasAnyPermission } = usePermissionContext();
  return hasAnyPermission(permissions) ? <>{children}</> : <>{fallback}</>;
}

interface CanAllProps {
  permissions: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function CanAll({
  permissions,
  children,
  fallback = null
}: CanAllProps) {
  const { hasAllPermissions } = usePermissionContext();
  return hasAllPermissions(permissions) ? <>{children}</> : <>{fallback}</>;
}
