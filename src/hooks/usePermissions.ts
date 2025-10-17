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

// All available permissions (for SNSD Admin fallback)
const ALL_PERMISSIONS = [
  // User permissions
  'users.read',
  'users.create',
  'users.update',
  'users.delete',
  'users.invite',
  'users.reset_password',
  // Role permissions
  'roles.read',
  'roles.create',
  'roles.update',
  'roles.delete',
  // Permission permissions
  'permissions.read',
  'permissions.assign',
  // Tenant permissions
  'tenants.read',
  'tenants.create',
  'tenants.update',
  'tenants.delete',
  'tenants.users.read',
  'tenants.users.manage',
  // Contractor permissions
  'contractors.read',
  'contractors.create',
  'contractors.update',
  'contractors.delete',
  // Evaluation permissions
  'evaluations.read',
  'evaluations.create',
  'evaluations.update',
  'evaluations.delete',
  'evaluations.submit',
  'evaluations.review',
  'evaluations.approve',
  // Payment permissions
  'payments.read',
  'payments.create',
  'payments.process',
  // Subscription permissions
  'subscriptions.read',
  'subscriptions.manage'
];

// Get current user's permissions
export function useMyPermissions() {
  return useQuery<UserPermissions>({
    queryKey: ['permissions', 'my'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<any>('/permissions/my');

        // Backend returns empty array instead of proper object
        // This is a workaround until backend is fixed
        if (Array.isArray(response)) {
          console.warn(
            '⚠️ [useMyPermissions] Backend returned array instead of object, using fallback'
          );
          // Get user profile to determine role
          const profile = await apiClient.get<any>('/profiles/me');

          return {
            user_id: profile.id,
            role_id: profile.role_id,
            role_name: profile.role_id === 1 ? 'SNSD Admin' : 'Unknown',
            // SNSD Admin (role_id: 1 or 0) gets all permissions
            permissions: profile.role_id <= 1 ? ALL_PERMISSIONS : []
          };
        }

        return response;
      } catch (error) {
        console.error(
          '❌ [useMyPermissions] Error fetching permissions:',
          error
        );
        throw error;
      }
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
