import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { buildQueryString } from '@/lib/query-params';
import { apiClient } from '@/lib/api-client';

// Types
export interface TenantUser {
  id: string;
  tenant_id: string;
  user_id: string;
  role_id: number;
  status: 'active' | 'inactive' | 'suspended';
  invited_by?: string;
  joined_at: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
  };
  role?: {
    id: number;
    name: string;
  };
  tenant?: {
    id: string;
    name: string;
  };
}

export interface TenantUserFilters {
  tenant_id?: string;
  role_id?: number;
  status?: 'active' | 'inactive' | 'suspended';
  limit?: number;
  offset?: number;
}

export interface CreateTenantUserDto {
  tenant_id: string;
  user_id: string;
  role_id: number;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface UpdateTenantUserDto {
  role_id?: number;
  status?: 'active' | 'inactive' | 'suspended';
}

// Get all tenant-user relationships with filters
export function useTenantUsers(filters?: TenantUserFilters) {
  return useQuery<TenantUser[]>({
    queryKey: ['tenant-users', filters],
    queryFn: async () => {
      const response = await apiClient.get<TenantUser[]>(
        `/tenant-users${buildQueryString(filters)}`
      );
      return response;
    }
  });
}

// Get users in a specific tenant
export function useTenanUsers(tenantId: string | undefined) {
  return useQuery<TenantUser[]>({
    queryKey: ['tenant-users', 'tenant', tenantId],
    queryFn: async () => {
      if (!tenantId) throw new Error('Tenant ID is required');
      const endpoint = `/tenant-users${buildQueryString({ tenant_id: tenantId })}`;
      const response = await apiClient.get<TenantUser[]>(endpoint);
      return response;
    },
    enabled: !!tenantId
  });
}

// Get single tenant-user relationship
export function useTenantUser(relationshipId: string | undefined) {
  return useQuery<TenantUser>({
    queryKey: ['tenant-users', relationshipId],
    queryFn: async () => {
      if (!relationshipId) throw new Error('Relationship ID is required');
      const response = await apiClient.get<TenantUser>(
        `/tenant-users/${relationshipId}`
      );
      return response;
    },
    enabled: !!relationshipId
  });
}

// Create tenant-user relationship
export function useCreateTenantUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTenantUserDto) => {
      const response = await apiClient.post<TenantUser>('/tenant-users', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });
}

// Update tenant-user relationship (change role or status)
export function useUpdateTenantUser(relationshipId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTenantUserDto) => {
      const response = await apiClient.patch<TenantUser>(
        `/tenant-users/${relationshipId}`,
        data
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-users'] });
      queryClient.invalidateQueries({
        queryKey: ['tenant-users', relationshipId]
      });
    }
  });
}

// Remove user from tenant
export function useRemoveTenantUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (relationshipId: string) => {
      await apiClient.delete(`/tenant-users/${relationshipId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });
}
