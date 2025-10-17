import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { buildQueryString } from '@/lib/query-params';

// Types
export interface Permission {
  id: number;
  name: string;
  category: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface UserPermissions {
  user_id: string;
  role_id: number;
  role_name: string;
  permissions: string[];
}

export interface PermissionCategory {
  category: string;
  count: number;
}

// Get all permissions (optionally filtered by category)
export function usePermissions(category?: string) {
  return useQuery<Permission[]>({
    queryKey: ['permissions', category],
    queryFn: async () => {
      const endpoint = `/permissions${buildQueryString(category ? { category } : {})}`;
      const response = await apiClient.get<Permission[]>(endpoint);
      return response;
    }
  });
}

// Get current user's permissions
export function useMyPermissions() {
  return useQuery<UserPermissions>({
    queryKey: ['permissions', 'my'],
    queryFn: async () => {
      const response = await apiClient.get<UserPermissions>('/permissions/my');
      return response;
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
}

// Get permission categories
export function usePermissionCategories() {
  return useQuery<string[]>({
    queryKey: ['permissions', 'categories'],
    queryFn: async () => {
      const response = await apiClient.get<string[]>('/permissions/categories');
      return response;
    },
    staleTime: 10 * 60 * 1000 // Cache for 10 minutes
  });
}

// Hook to check if user has a specific permission
export function useHasPermission(permission: string): boolean {
  const { data } = useMyPermissions();
  return data?.permissions.includes(permission) ?? false;
}

// Hook to check if user has any of the specified permissions
export function useHasAnyPermission(permissions: string[]): boolean {
  const { data } = useMyPermissions();
  if (!data) return false;
  return permissions.some((p) => data.permissions.includes(p));
}

// Hook to check if user has all of the specified permissions
export function useHasAllPermissions(permissions: string[]): boolean {
  const { data } = useMyPermissions();
  if (!data) return false;
  return permissions.every((p) => data.permissions.includes(p));
}
