import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { buildQueryString } from '@/lib/query-params';
import { apiClient } from '@/lib/api-client';

// Types for new admin user management API
export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role_id: number;
  tenant_id?: string;
  phone?: string;
  department?: string;
  job_title?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  roles?: {
    id: number;
    name: string;
  };
  tenant?: {
    id: string;
    name: string;
  };
}

export interface UserFilters {
  search?: string;
  role_id?: number;
  tenant_id?: string;
  status?: 'active' | 'inactive' | 'suspended';
  limit?: number;
  offset?: number;
}

export interface CreateUserDto {
  email: string;
  password: string;
  full_name: string;
  role_id: number;
  tenant_id?: string;
  metadata?: Record<string, any>;
}

export interface UpdateUserDto {
  full_name?: string;
  role_id?: number;
  phone?: string;
  department?: string;
  job_title?: string;
  status?: 'active' | 'inactive' | 'suspended';
  metadata?: Record<string, any>;
}

export interface UserTenant {
  id: string;
  tenant_id: string;
  user_id: string;
  role_id: number;
  status: string;
  joined_at: string;
  tenant: {
    id: string;
    name: string;
  };
  role: {
    id: number;
    name: string;
  };
}

// Get all users with filters (admin only)
export function useAdminUsers(filters?: UserFilters) {
  return useQuery<AdminUser[]>({
    queryKey: ['admin-users', filters],
    queryFn: async () => {
      const response = await apiClient.get<AdminUser[]>(
        `/users${buildQueryString(filters)}`
      );
      return response;
    }
  });
}

// Get single user by ID (admin only)
export function useAdminUser(userId: string | undefined) {
  return useQuery<AdminUser>({
    queryKey: ['admin-users', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const response = await apiClient.get<AdminUser>(`/users/${userId}`);
      return response;
    },
    enabled: !!userId
  });
}

// Get user's tenants
export function useAdminUserTenants(userId: string | undefined) {
  return useQuery<UserTenant[]>({
    queryKey: ['admin-users', userId, 'tenants'],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const response = await apiClient.get<UserTenant[]>(
        `/users/${userId}/tenants`
      );
      return response;
    },
    enabled: !!userId
  });
}

// Create new user (admin only)
export function useCreateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserDto) => {
      const response = await apiClient.post<AdminUser>('/users', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });
}

// Update user (admin only)
export function useUpdateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserDto }) => {
      const response = await apiClient.patch<AdminUser>(`/users/${id}`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({
        queryKey: ['admin-users', variables.id]
      });
    }
  });
}

// Delete user - soft delete (admin only)
export function useDeleteAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });
}

// Reset user password (admin only)
export function useResetUserPassword() {
  return useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.post(`/users/${userId}/reset-password`, {});
    }
  });
}

// Add user to tenant (admin only)
export function useAddUserToTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      userId: string;
      tenantId: string;
      role_id?: number;
    }) => {
      const { userId, tenantId, role_id } = data;
      const response = await apiClient.post(`/users/${userId}/tenants`, {
        tenant_id: tenantId,
        role_id
      });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-users', variables.userId, 'tenants']
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-users'] });
    }
  });
}

// Remove user from tenant (admin only)
export function useRemoveUserFromTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userId: string; tenantId: string }) => {
      const { userId, tenantId } = data;
      await apiClient.delete(`/users/${userId}/tenants/${tenantId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-users', variables.userId, 'tenants']
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-users'] });
    }
  });
}
